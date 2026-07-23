import type { ProfileChanges } from "../index";
import { match, P } from "ts-pattern";
import { useNativeResourceTypeBehaviorStorage, useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { updateBadgeCount } from "./badge";
import { buildAction } from "./buildAction";
import { buildCondition } from "./buildCondition";

const { item: profileId2ErrorMessageRecordItem } = useProfileId2ErrorMessageRecordStorage();
const { item: profileId2RelatedRuleIdRecordItem } = useProfileId2RelatedRuleIdRecordStorage();

/**
 * Intentionally registers DNR rules one by one instead of batching them.
 * A single invalid rule should not cause every other rule in the batch to fail,
 * and per-rule registration is what lets us associate an error message with the
 * specific profile/rule that caused it.
 */
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
    updateBadgeCount(),
  ]);
}

interface RuleUpdateResult {
  success: boolean;
  profileId: string;
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
      removeRuleIds: match(ruleId)
        .with(P.number, id => [id])
        .otherwise(() => undefined),
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

    const rule = {
      id: await getNewRuleId(),
      priority: profile.priority ?? 1,
      condition,
      action,
    } as const satisfies Browser.declarativeNetRequest.Rule;

    // Treat creation as an upsert too. A full re-registration and a queued
    // profile-created storage event can otherwise register the same profile
    // twice and leave the first rule without a profile-to-rule mapping.
    const record = await profileId2RelatedRuleIdRecordItem.getValue();
    const deleteRuleId = record[profile.id];

    const result = await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: match(deleteRuleId)
        .with(P.number, id => [id])
        .otherwise(() => undefined),
      addRules: [rule],
    }).then(() => {
      return {
        success: true,
        profileId: profile.id,
        newRuleId: rule.id,
      } as const;
    }).catch(async (error) => {
      // If updating the old rule failed, try to remove it again to avoid dangling rules.
      if (deleteRuleId) {
        await browser.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [deleteRuleId],
        });
      }
      return {
        success: false,
        profileId: profile.id,
        deleteRuleId,
        error,
      } as const;
    });

    results.push({ status: "fulfilled", value: result });
  }

  return results;
}

async function handleRegistrationRelatedRuleIdChange(options: { upsertRecord?: Record<string, number>; deleteIds?: string[] }) {
  const { upsertRecord = {}, deleteIds = [] } = options;
  const currentRecord = await profileId2RelatedRuleIdRecordItem.getValue();
  const newRecord = { ...currentRecord, ...upsertRecord };
  for (const id of deleteIds) {
    delete newRecord[id];
  }
  await profileId2RelatedRuleIdRecordItem.setValue(newRecord);
}

async function handleRegistrationErrorMessageChange(options: { upsertRecord?: Record<string, string>; deleteIds?: string[] }) {
  const { upsertRecord = {}, deleteIds = [] } = options;
  const currentRecord = await profileId2ErrorMessageRecordItem.getValue();
  const newRecord = { ...currentRecord, ...upsertRecord };
  for (const id of deleteIds) {
    delete newRecord[id];
  }
  await profileId2ErrorMessageRecordItem.setValue(newRecord);
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

/**
 * Repairs the non-atomic boundary between DNR storage and extension storage.
 *
 * The service worker can stop after a DNR update succeeds but before the
 * corresponding profile-to-rule mapping is persisted (or vice versa). DNR
 * rules survive that restart, so reconcile both sides when the worker starts.
 */
export async function reconcileRuleRegistrationState(registerableProfileIds: Iterable<string>) {
  const [rules, registrationRecord] = await Promise.all([
    browser.declarativeNetRequest.getDynamicRules(),
    profileId2RelatedRuleIdRecordItem.getValue(),
  ]);
  const existingRuleIds = new Set(rules.map(rule => rule.id));
  const registerableProfileIdSet = new Set(registerableProfileIds);
  const validRegistrationRecord = Object.fromEntries(
    Object.entries(registrationRecord).filter(([profileId, ruleId]) =>
      registerableProfileIdSet.has(profileId) && existingRuleIds.has(ruleId),
    ),
  );
  const registeredRuleIds = new Set(Object.values(validRegistrationRecord));
  const unrelatedRuleIds = rules
    .map(rule => rule.id)
    .filter(ruleId => !registeredRuleIds.has(ruleId));

  // Keep stale mappings until their rules are definitely gone. If DNR removal
  // fails, the next worker start can still identify and retry those rules.
  if (unrelatedRuleIds.length > 0) {
    await browser.declarativeNetRequest.updateDynamicRules({ removeRuleIds: unrelatedRuleIds });
  }
  if (!isSameRecord(registrationRecord, validRegistrationRecord)) {
    await profileId2RelatedRuleIdRecordItem.setValue(validRegistrationRecord);
  }
}

function isSameRecord(
  left: Record<string, number>,
  right: Record<string, number>,
) {
  const leftEntries = Object.entries(left);
  return leftEntries.length === Object.keys(right).length
    && leftEntries.every(([key, value]) => right[key] === value);
}
