import type { ProfileChanges } from "../index";
import type { RuleType } from "@/lib/schema";
import type { RuleRegistration } from "@/lib/storage";
import { match } from "ts-pattern";
import { useNativeResourceTypeBehaviorStorage, useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { buildAction } from "./buildAction";
import { buildCondition } from "./buildCondition";
import { updateBadgeCount } from "./util";

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

  const profileId2ErrorRecord: Record<string, string> = {};
  const deleteErrorMessageIds: string[] = [];
  const profileId2RelatedRuleIdRecord: Record<string, RuleRegistration> = {};
  const deleteRelatedRuleIds: string[] = [];
  for (const result of [...deleteResults, ...updateResults]) {
    if (result.deleteRegistration) {
      deleteRelatedRuleIds.push(result.profileId);
    }
    if (result.newRegistration) {
      profileId2RelatedRuleIdRecord[result.profileId] = result.newRegistration;
    }
    if (result.success) {
      deleteErrorMessageIds.push(result.profileId);
    } else {
      profileId2ErrorRecord[result.profileId] = String(result.error);
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
  deleteRegistration?: boolean;
  newRegistration?: RuleRegistration;
}

async function deleteRules(changes: Pick<ProfileChanges, "deleted">) {
  const results: RuleUpdateResult[] = [];
  const registrationRecord = await profileId2RelatedRuleIdRecordItem.getValue();

  for (const deletedProfile of changes.deleted) {
    const registration = registrationRecord[deletedProfile.id];
    if (!registration) {
      results.push({
        success: true,
        profileId: deletedProfile.id,
        deleteRegistration: true,
      });
      continue;
    }

    const result = await updateScopedRules(registration.ruleScope, {
      removeRuleIds: [registration.ruleId],
    }).then(() => ({
      success: true,
      profileId: deletedProfile.id,
      deleteRegistration: true,
    } as const)).catch(error => ({
      success: false,
      profileId: deletedProfile.id,
      error,
    } as const));
    results.push(result);
  }

  return results;
}

async function upsertRules(changes: Pick<ProfileChanges, "created" | "modified">) {
  const results: RuleUpdateResult[] = [];
  const profilesToRegister = [...changes.created, ...changes.modified];
  const { item: nativeResourceTypeBehaviorItem } = useNativeResourceTypeBehaviorStorage();
  const nativeResourceTypeBehavior = await nativeResourceTypeBehaviorItem.getValue();
  const registrationRecord = await profileId2RelatedRuleIdRecordItem.getValue();

  for (const profile of profilesToRegister) {
    const ruleScope = profile.ruleScope ?? "dynamic";
    const previousRegistration = match(changes.modified.includes(profile))
      .with(true, () => registrationRecord[profile.id])
      .with(false, () => undefined)
      .exhaustive();
    const rule = {
      id: await getNewRuleId(ruleScope),
      priority: profile.priority ?? 1,
      condition: buildCondition(profile, { nativeResourceTypeBehavior }),
      action: buildAction(profile),
    } as const satisfies Browser.declarativeNetRequest.Rule;

    let previousRuleRemoved = false;
    try {
      if (previousRegistration && previousRegistration.ruleScope !== ruleScope) {
        await updateScopedRules(previousRegistration.ruleScope, {
          removeRuleIds: [previousRegistration.ruleId],
        });
        previousRuleRemoved = true;
      }

      await updateScopedRules(ruleScope, {
        removeRuleIds: match(previousRegistration)
          .with({ ruleScope }, registration => [registration.ruleId])
          .otherwise(() => undefined),
        addRules: [rule],
      });
      results.push({
        success: true,
        profileId: profile.id,
        newRegistration: {
          ruleId: rule.id,
          ruleScope,
        },
      });
    } catch (error) {
      if (previousRegistration?.ruleScope === ruleScope) {
        try {
          await updateScopedRules(ruleScope, {
            removeRuleIds: [previousRegistration.ruleId],
          });
          previousRuleRemoved = true;
        } catch {}
      }
      results.push({
        success: false,
        profileId: profile.id,
        deleteRegistration: previousRuleRemoved,
        error,
      });
    }
  }

  return results;
}

async function handleRegistrationRelatedRuleIdChange(options: {
  upsertRecord?: Record<string, RuleRegistration>;
  deleteIds?: string[];
}) {
  const { upsertRecord = {}, deleteIds = [] } = options;
  const currentRecord = await profileId2RelatedRuleIdRecordItem.getValue();
  const newRecord = { ...currentRecord };
  for (const id of deleteIds) {
    delete newRecord[id];
  }
  Object.assign(newRecord, upsertRecord);
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

async function getNewRuleId(ruleScope: RuleType) {
  const existingRules = await getScopedRules(ruleScope);
  return findMissingPositive(existingRules.map(rule => rule.id));
}

function findMissingPositive(numbers: number[]) {
  const set = new Set(numbers);
  let i = 1;
  while (set.has(i)) i++;
  return i;
}

function getScopedRules(ruleScope: RuleType) {
  return match(ruleScope)
    .with("dynamic", () => browser.declarativeNetRequest.getDynamicRules())
    .with("session", () => browser.declarativeNetRequest.getSessionRules())
    .exhaustive();
}

function updateScopedRules(
  ruleScope: RuleType,
  options: Browser.declarativeNetRequest.UpdateRuleOptions,
) {
  return match(ruleScope)
    .with("dynamic", () => browser.declarativeNetRequest.updateDynamicRules(options))
    .with("session", () => browser.declarativeNetRequest.updateSessionRules(options))
    .exhaustive();
}

export async function reconcileRuleRegistrationState() {
  const [registrationRecord, dynamicRules, sessionRules] = await Promise.all([
    profileId2RelatedRuleIdRecordItem.getValue(),
    browser.declarativeNetRequest.getDynamicRules(),
    browser.declarativeNetRequest.getSessionRules(),
  ]);
  const existingRuleIds = {
    dynamic: new Set(dynamicRules.map(rule => rule.id)),
    session: new Set(sessionRules.map(rule => rule.id)),
  } satisfies Record<RuleType, Set<number>>;
  const validRegistrationRecord = Object.fromEntries(
    Object.entries(registrationRecord).filter(([, registration]) =>
      existingRuleIds[registration.ruleScope].has(registration.ruleId),
    ),
  );

  if (Object.keys(validRegistrationRecord).length !== Object.keys(registrationRecord).length) {
    await profileId2RelatedRuleIdRecordItem.setValue(validRegistrationRecord);
  }
}
