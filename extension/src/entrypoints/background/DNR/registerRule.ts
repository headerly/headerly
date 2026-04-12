import type { ProfileChanges } from "../index";
import type { UpdateProfileErrorMessageOptions, UpdateProfileRelatedRuleIdOptions, UpdateProfileRuleScopeOptions } from "../message";
import { useNativeResourceTypeBehaviorStorage, useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage, useProfileId2RuleScopeRecordStorage } from "@/lib/storage";
import { sendMessage } from "../message";
import { buildAction } from "./buildAction";
import { buildCondition } from "./buildCondition";
import { logReceivingEndDoesNotExistOtherError, updateBadgeCount } from "./util";

const { item: profileId2ErrorMessageRecordItem } = useProfileId2ErrorMessageRecordStorage();
const { item: profileId2RelatedRuleIdRecordItem } = useProfileId2RelatedRuleIdRecordStorage();
const { item: profileId2RuleScopeRecordItem } = useProfileId2RuleScopeRecordStorage();

export async function updateRules(changes: ProfileChanges) {
  const [deleteResults, updateResults] = await Promise.all([
    deleteRules({ deleted: changes.deleted }),
    upsertRules({ created: changes.created, modified: changes.modified }),
  ]);

  const allResults = [...deleteResults, ...updateResults];

  const profileId2ErrorRecord: Record<string, string> = {};
  const deleteErrorMessageIds: string[] = [];
  const profileId2RelatedRuleIdRecord: Record<string, number> = {};
  const deleteRelatedRuleIds: string[] = [];
  const profileId2RuleScopeRecord: Record<string, "dynamic" | "session"> = {};
  const deleteRuleScopeIds: string[] = [];
  for (const result of allResults) {
    if (result.status !== "fulfilled") {
      continue;
    }
    if (result.value.deleteRuleId) {
      deleteRelatedRuleIds.push(result.value.profileId);
      deleteRuleScopeIds.push(result.value.profileId);
    }
    if (result.value.newRuleId) {
      profileId2RelatedRuleIdRecord[result.value.profileId] = result.value.newRuleId;
    }
    if (result.value.newRuleScope) {
      profileId2RuleScopeRecord[result.value.profileId] = result.value.newRuleScope;
    }
    if (result.value.success) {
      deleteErrorMessageIds.push(result.value.profileId);
    } else {
      profileId2ErrorRecord[result.value.profileId] = String(result.value.error);
    }
  }
  await Promise.all([
    handleRegistrationRelatedRuleIdChange({
      upsertRecord: profileId2RelatedRuleIdRecord,
      deleteIds: deleteRelatedRuleIds,
    }),
    handleRegistrationRuleScopeChange({
      upsertRecord: profileId2RuleScopeRecord,
      deleteIds: deleteRuleScopeIds,
    }),
    handleRegistrationErrorMessageChange({
      upsertRecord: profileId2ErrorRecord,
      deleteIds: deleteErrorMessageIds,
    }),
    updateBadgeCount(),
  ]);
}

interface RuleUpdateResult {
  success: boolean;
  profileId: string;
  error?: unknown;
  deleteRuleId?: number;
  newRuleId?: number;
  newRuleScope?: "dynamic" | "session";
};

function updateRulesByScope(scope: "dynamic" | "session", options: Browser.declarativeNetRequest.UpdateRuleOptions) {
  return scope === "session"
    ? browser.declarativeNetRequest.updateSessionRules(options)
    : browser.declarativeNetRequest.updateDynamicRules(options);
}

async function deleteRules(changes: Pick<ProfileChanges, "deleted">) {
  const results: Array<PromiseSettledResult<RuleUpdateResult>> = [];

  // Handle deleted profiles - only remove rules
  const ruleScopeRecord = await profileId2RuleScopeRecordItem.getValue();
  for (const deletedProfile of changes.deleted) {
    const profileId2RelatedRuleIdRecord = await profileId2RelatedRuleIdRecordItem.getValue();
    const ruleId = profileId2RelatedRuleIdRecord[deletedProfile.id];
    const scope = ruleScopeRecord[deletedProfile.id] ?? "dynamic";
    await updateRulesByScope(scope, {
      removeRuleIds: ruleId ? [ruleId] : undefined,
    });
    results.push({
      status: "fulfilled",
      value: {
        success: true,
        profileId: deletedProfile.id,
        deleteRuleId: ruleId,
      },
    });
  }

  return results;
}

async function upsertRules(changes: Pick<ProfileChanges, "created" | "modified">) {
  const results: Array<PromiseSettledResult<RuleUpdateResult>> = [];

  // Handle created and modified profiles - add new rules (modified also removes old ones)
  const profilesToRegister = [...changes.created, ...changes.modified];
  const { item: nativeResourceTypeBehaviorItem } = useNativeResourceTypeBehaviorStorage();
  const nativeResourceTypeBehavior = await nativeResourceTypeBehaviorItem.getValue();
  const ruleScopeRecord = await profileId2RuleScopeRecordItem.getValue();
  for (const profile of profilesToRegister) {
    const condition = buildCondition(profile, { nativeResourceTypeBehavior });
    const action = buildAction(profile);
    const hasActions = action.requestHeaders?.length || action.responseHeaders?.length;
    const newScope = profile.ruleScope;

    const rule = {
      id: await getNewRuleId(),
      priority: profile.priority ?? 1,
      condition,
      action,
    } as const satisfies Browser.declarativeNetRequest.Rule;

    // For modified profiles, remove old rule first (may be in a different scope)
    const record = await profileId2RelatedRuleIdRecordItem.getValue();
    const isModified = changes.modified.includes(profile);
    const deleteRuleId = isModified ? record[profile.id] : undefined;
    const oldScope = ruleScopeRecord[profile.id] ?? "dynamic";

    const result = await (async () => {
      // If modified and scope changed, delete from old scope, add to new scope separately
      if (deleteRuleId && oldScope !== newScope) {
        await updateRulesByScope(oldScope, { removeRuleIds: [deleteRuleId] });
        if (hasActions) {
          await updateRulesByScope(newScope, { addRules: [rule] });
        }
      } else {
        await updateRulesByScope(newScope, {
          removeRuleIds: deleteRuleId ? [deleteRuleId] : undefined,
          addRules: hasActions ? [rule] : undefined,
        });
      }
      return {
        success: true,
        profileId: profile.id,
        deleteRuleId: deleteRuleId && !hasActions ? deleteRuleId : undefined,
        newRuleId: hasActions ? rule.id : undefined,
        newRuleScope: hasActions ? newScope : undefined,
      };
    })().catch(async (error) => {
      const isUpdateOldRuleError = hasActions && deleteRuleId;
      // If updating the old rule failed, try to remove it again to avoid dangling rules.
      if (isUpdateOldRuleError) {
        await updateRulesByScope(oldScope, {
          removeRuleIds: [deleteRuleId],
        });
      }
      return {
        success: false,
        profileId: profile.id,
        deleteRuleId: isUpdateOldRuleError ? deleteRuleId : undefined,
        error,
      };
    });

    results.push({ status: "fulfilled", value: result });
  }

  return results;
}

async function handleRegistrationRelatedRuleIdChange(options: UpdateProfileRelatedRuleIdOptions) {
  const { upsertRecord = {}, deleteIds = [] } = options;
  try {
    await sendMessage("updateProfileRelatedRuleId", {
      upsertRecord,
      deleteIds,
    });
  } catch (error) {
    logReceivingEndDoesNotExistOtherError(error);
    const currentRecord = await profileId2RelatedRuleIdRecordItem.getValue();
    const newRecord = { ...currentRecord, ...upsertRecord };
    for (const id of deleteIds) {
      delete newRecord[id];
    }
    await profileId2RelatedRuleIdRecordItem.setValue(newRecord);
  }
}

async function handleRegistrationRuleScopeChange(options: UpdateProfileRuleScopeOptions) {
  const { upsertRecord = {}, deleteIds = [] } = options;
  try {
    await sendMessage("updateProfileRuleScope", {
      upsertRecord,
      deleteIds,
    });
  } catch (error) {
    logReceivingEndDoesNotExistOtherError(error);
    const currentRecord = await profileId2RuleScopeRecordItem.getValue();
    const newRecord = { ...currentRecord, ...upsertRecord };
    for (const id of deleteIds) {
      delete newRecord[id];
    }
    await profileId2RuleScopeRecordItem.setValue(newRecord);
  }
}

async function handleRegistrationErrorMessageChange(options: UpdateProfileErrorMessageOptions) {
  const { upsertRecord = {}, deleteIds = [] } = options;
  try {
    await sendMessage("updateProfileErrorMessage", {
      upsertRecord,
      deleteIds,
    });
  } catch (error) {
    logReceivingEndDoesNotExistOtherError(error);
    const currentRecord = await profileId2ErrorMessageRecordItem.getValue();
    const newRecord = { ...currentRecord, ...upsertRecord };
    for (const id of deleteIds) {
      delete newRecord[id];
    }
    await profileId2ErrorMessageRecordItem.setValue(newRecord);
  }
}

async function getNewRuleId() {
  const [dynamicRules, sessionRules] = await Promise.all([
    browser.declarativeNetRequest.getDynamicRules(),
    browser.declarativeNetRequest.getSessionRules(),
  ]);
  const existingIds = [...dynamicRules, ...sessionRules].map(r => r.id);
  return findMissingPositive(existingIds);
}

function findMissingPositive(numbers: number[]) {
  const set = new Set(numbers);
  let i = 1;
  while (set.has(i)) i++;
  return i;
}
