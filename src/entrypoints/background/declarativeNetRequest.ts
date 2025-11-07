import type { UUID } from "node:crypto";
import type { ProfileChanges, ProfileCoreData } from "./index";
import { useProfileManagerStorage } from "@/lib/storage";
import { sendMessage } from "./message";

const { item: profileManagerItem } = useProfileManagerStorage();

export async function unregisterAllRules() {
  const oldRules = await browser.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map(r => r.id);
  if (!oldRuleIds.length) {
    return;
  }
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
  });
  const manager = await profileManagerItem.getValue();
  await profileManagerItem.setValue({
    ...manager!,
    profiles: manager!.profiles.map(profile => ({
      ...profile,
      errorMessage: undefined,
      relatedRuleId: 0,
    })),
  });
}

export async function updateRules(changes: ProfileChanges) {
  const deleteResults = await deleteRules({ deleted: changes.deleted });
  const updateResults = await upsertRules({ created: changes.created, modified: changes.modified });

  const allResults = [...deleteResults, ...updateResults];

  const profileId2ErrorMap: Record<UUID, string> = {};
  allResults
    .filter((result): result is PromiseFulfilledResult<{ success: false; profileId: UUID; error: unknown }> =>
      result.status === "fulfilled" && !result.value.success,
    )
    .forEach((result) => {
      profileId2ErrorMap[result.value.profileId] = String(result.value.error);
    });

  await handleRegistrationErrors(profileId2ErrorMap);
}

async function deleteRules(changes: Pick<ProfileChanges, "deleted">) {
  const results: Array<PromiseSettledResult<{ success: boolean; profileId: UUID; error?: unknown }>> = [];

  // Handle deleted profiles - only remove rules
  for (const deletedProfile of changes.deleted) {
    const ruleId = deletedProfile.relatedRuleId;
    const result = await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId],
    }).then(async () => {
      try {
        await sendMessage("updateProfileRelatedRuleId", { [deletedProfile.id]: 0 });
      } catch (error) {
        logReceivingEndDoesNotExistOtherError(error);
        const manager = await profileManagerItem.getValue();
        await profileManagerItem.setValue({
          ...manager!,
          profiles: manager!.profiles.map(p => p.id === deletedProfile.id ? { ...p, relatedRuleId: 0 } : p),
        });
      }
      return { success: true, profileId: deletedProfile.id } as const;
    }).catch((error) => {
      return { success: false, profileId: deletedProfile.id, error } as const;
    });
    results.push({ status: "fulfilled", value: result });
  }

  return results;
}

async function upsertRules(changes: Pick<ProfileChanges, "created" | "modified">) {
  const results: Array<PromiseSettledResult<{ success: boolean; profileId: UUID; error?: unknown }>> = [];

  // Handle created and modified profiles - add new rules (modified also removes old ones)
  const profilesToRegister = [...changes.created, ...changes.modified];

  for (const profile of profilesToRegister) {
    const condition = buildRuleCondition(profile);
    const requestHeaders = buildRequestHeaders(profile);
    const responseHeaders = buildResponseHeaders(profile);

    // Skip if no actions
    if (requestHeaders.length === 0 && responseHeaders.length === 0) {
      continue;
    }

    const rule = {
      id: await getNewRuleId(),
      priority: 1,
      condition,
      action: {
        type: "modifyHeaders",
        requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
        responseHeaders: responseHeaders.length > 0 ? responseHeaders : undefined,
      },
    } as const satisfies Browser.declarativeNetRequest.Rule;

    // For modified profiles, remove old rule first
    const deleteOldRuleId = changes.modified.includes(profile)
      ? profile.relatedRuleId
      : undefined;

    const result = await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: deleteOldRuleId ? [deleteOldRuleId] : [],
      addRules: [rule],
    }).then(async () => {
      try {
        await sendMessage("updateProfileRelatedRuleId", { [profile.id]: rule.id });
      } catch (error) {
        logReceivingEndDoesNotExistOtherError(error);
        const manager = await profileManagerItem.getValue();
        await profileManagerItem.setValue({
          ...manager!,
          profiles: manager!.profiles.map(p => p.id === profile.id ? { ...p, relatedRuleId: rule.id } : p),
        });
      }
      return { success: true, profileId: profile.id } as const;
    }).catch((error) => {
      return { success: false, profileId: profile.id, error } as const;
    });

    results.push({ status: "fulfilled", value: result });
  }

  return results;
}

function buildRuleCondition(profile: ProfileCoreData) {
  const condition: Browser.declarativeNetRequest.RuleCondition = {};

  if (profile.filters.urlFilter?.length) {
    const enabledUrlFilter = profile.filters.urlFilter.find(f => f.enabled);
    if (enabledUrlFilter && enabledUrlFilter.value.trim()) {
      condition.urlFilter = enabledUrlFilter.value.trim();
    }
  }

  if (profile.filters.regexFilter?.length) {
    const enabledRegexFilter = profile.filters.regexFilter.find(f => f.enabled);
    if (enabledRegexFilter && enabledRegexFilter.value.trim()) {
      condition.regexFilter = enabledRegexFilter.value.trim();
    }
  }

  if (profile.filters.requestDomains?.items.length) {
    const enabledDomains = profile.filters.requestDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (enabledDomains.length > 0) {
      condition.requestDomains = enabledDomains;
    }
  }

  if (profile.filters.excludedRequestDomains?.items.length) {
    const excludedDomains = profile.filters.excludedRequestDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (excludedDomains.length > 0) {
      condition.excludedRequestDomains = excludedDomains;
    }
  }

  if (profile.filters.initiatorDomains?.items.length) {
    const initiatorDomains = profile.filters.initiatorDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (initiatorDomains.length > 0) {
      condition.initiatorDomains = initiatorDomains;
    }
  }

  if (profile.filters.excludedInitiatorDomains?.items.length) {
    const excludedInitiatorDomains = profile.filters.excludedInitiatorDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (excludedInitiatorDomains.length > 0) {
      condition.excludedInitiatorDomains = excludedInitiatorDomains;
    }
  }

  return condition;
}

function buildRequestHeaders(profile: ProfileCoreData) {
  const requestHeaders: Browser.declarativeNetRequest.ModifyHeaderInfo[] = [];

  for (const group of profile.requestHeaderModGroups) {
    const enabledMods = group.items.filter(mod => mod.enabled);
    for (const mod of enabledMods) {
      if (mod.name.trim()) {
        const headerInfo = {
          // `toLowerCase()` is only for compatibility with older browsers.
          // https://issues.chromium.org/issues/449152902 was fixed on 2025-10-31.
          header: mod.name.trim().toLowerCase(),
          operation: mod.operation,
        } satisfies Browser.declarativeNetRequest.ModifyHeaderInfo;
        if (mod.operation !== "remove") {
          requestHeaders.push({ ...headerInfo, value: mod.value.trim() });
        } else {
          requestHeaders.push(headerInfo);
        }
      }
    }
  }

  // Process sync cookies as Cookie header appends
  for (const group of profile.syncCookieGroups) {
    const enabledCookies = group.items.filter(cookie => cookie.enabled);
    for (const cookie of enabledCookies) {
      if (cookie.name.trim() && cookie.value.trim()) {
        requestHeaders.push({
          header: "cookie",
          operation: "append",
          value: `${cookie.name.trim()}=${cookie.value.trim()}`,
        });
      }
    }
  }

  return requestHeaders;
}

function buildResponseHeaders(profile: ProfileCoreData) {
  const responseHeaders: Browser.declarativeNetRequest.ModifyHeaderInfo[] = [];

  for (const group of profile.responseHeaderModGroups) {
    const enabledMods = group.items.filter(mod => mod.enabled);
    for (const mod of enabledMods) {
      if (mod.name.trim()) {
        const headerInfo: Browser.declarativeNetRequest.ModifyHeaderInfo = {
          header: mod.name.trim(),
          operation: mod.operation,
        };
        if (mod.operation !== "remove") {
          responseHeaders.push({ ...headerInfo, value: mod.value.trim() });
        } else {
          responseHeaders.push(headerInfo);
        }
      }
    }
  }

  return responseHeaders;
}

async function handleRegistrationErrors(profileId2ErrorMap: Record<UUID, string>) {
  const updateStorageWithErrors = async () => {
    const profileManager = await profileManagerItem.getValue();
    if (!profileManager) {
      return;
    }
    const profileManagerWithErrorMassage = {
      ...profileManager,
      profiles: profileManager.profiles.map(profile => ({
        ...profile,
        errorMessage: profileId2ErrorMap[profile.id],
      })),
    };
    await profileManagerItem.setValue(profileManagerWithErrorMassage);
  };

  try {
    await sendMessage("updateProfileErrorMessage", profileId2ErrorMap);
  } catch (error) {
    logReceivingEndDoesNotExistOtherError(error);
    await updateStorageWithErrors();
  }
}

function logReceivingEndDoesNotExistOtherError(error: unknown): boolean {
  const result = error instanceof Error && error.message === "Could not establish connection. Receiving end does not exist.";
  if (!result) {
    console.error("Failed to send data to extension page:", error);
  }
  return result;
}

async function getNewRuleId() {
  const existingRules = await browser.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(r => r.id);
  return findMissingPositive(existingIds);
}

function findMissingPositive(numbers: number[]) {
  const set = new Set(numbers);
  let i = 1;
  while (set.has(i)) i++;
  return i;
}
