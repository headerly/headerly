import type { UUID } from "node:crypto";
import type { ProfileChanges } from "../index";
import type { UpdateProfileErrorMessageOptions, UpdateProfileRelatedRuleIdOptions } from "../message";
import { useNativeResourceTypeBehaviorStorage, useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { sendMessage } from "../message";
import { buildAction } from "./buildAction";
import { buildCondition } from "./buildCondition";
import { logReceivingEndDoesNotExistOtherError, updateBadge } from "./util";

const { item: profileId2ErrorMessageRecordItem } = useProfileId2ErrorMessageRecordStorage();
const { item: profileId2RelatedRuleIdRecordItem } = useProfileId2RelatedRuleIdRecordStorage();

export async function updateRules(changes: ProfileChanges) {
  const [deleteResults, updateResults] = await Promise.all([
    deleteRules({ deleted: changes.deleted }),
    upsertRules({ created: changes.created, modified: changes.modified }),
  ]);

  const allResults = [...deleteResults, ...updateResults];

  const profileId2ErrorRecord: Record<UUID, string> = {};
  const deleteErrorMessageIds: UUID[] = [];
  const profileId2RelatedRuleIdRecord: Record<UUID, number> = {};
  const deleteRelatedRuleIds: UUID[] = [];
  for (const result of allResults) {
    if (result.status !== "fulfilled") {
      continue;
    }
    if (result.value.deleteRuleId) {
      deleteRelatedRuleIds.push(result.value.profileId);
    }
    if (result.value.newRuleId) {
      profileId2RelatedRuleIdRecord[result.value.profileId] = result.value.newRuleId;
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
    handleRegistrationErrorMessageChange({
      upsertRecord: profileId2ErrorRecord,
      deleteIds: deleteErrorMessageIds,
    }),
    updateBadge(),
  ]);
}

interface RuleUpdateResult {
  success: boolean;
  profileId: UUID;
  error?: unknown;
  deleteRuleId?: number;
  newRuleId?: number;
};

async function deleteRules(changes: Pick<ProfileChanges, "deleted">) {
  const results: Array<PromiseSettledResult<RuleUpdateResult>> = [];

  // Handle deleted profiles - only remove rules
  for (const deletedProfile of changes.deleted) {
    const profileId2RelatedRuleIdRecord = await profileId2RelatedRuleIdRecordItem.getValue();
    const ruleId = profileId2RelatedRuleIdRecord[deletedProfile.id];
    await browser.declarativeNetRequest.updateDynamicRules({
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
  for (const profile of profilesToRegister) {
    const condition = buildCondition(profile, { nativeResourceTypeBehavior });
    const action = buildAction(profile);
    const hasActions = action.requestHeaders?.length || action.responseHeaders?.length;

    const rule = {
      id: await getNewRuleId(),
      priority: 1,
      condition,
      action,
    } as const satisfies Browser.declarativeNetRequest.Rule;

    // For modified profiles, remove old rule first
    const record = await profileId2RelatedRuleIdRecordItem.getValue();
    const deleteRuleId = changes.modified.includes(profile)
      ? record[profile.id]
      : undefined;

    const result = await browser.declarativeNetRequest.updateDynamicRules({
      // If there are no actions, simply delete the rule(if exists).
      removeRuleIds: deleteRuleId ? [deleteRuleId] : undefined,
      addRules: hasActions ? [rule] : undefined,
    }).then(async () => {
      return {
        success: true,
        profileId: profile.id,
        deleteRuleId: deleteRuleId && !hasActions ? deleteRuleId : undefined,
        newRuleId: hasActions ? rule.id : undefined,
      };
    }).catch(async (error) => {
      const isUpdateOldRuleError = hasActions && deleteRuleId;
      // If updating the old rule failed, try to remove it again to avoid dangling rules.
      if (isUpdateOldRuleError) {
        await browser.declarativeNetRequest.updateDynamicRules({
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
