import type { ProfileChanges } from "../diffProfiles";
import type { RuleScope } from "../profileRule";
import type { RuleRegistration } from "@/lib/storage";
import { isEqual } from "es-toolkit";
import { match } from "ts-pattern";
import { useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { deriveRuleScope, RULE_SCOPES } from "../profileRule";
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
export async function updateRules({
  created = [],
  modified = [],
  deleted = [],
}: Partial<ProfileChanges>) {
  const [deleteResults, updateResults] = await Promise.all([
    deleteRules({ deleted }),
    upsertRules({ created, modified }),
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
  // Persist the rule mapping first so reconciliation never races an unfinished
  // mapping write if the error-record update fails.
  await handleRegistrationRelatedRuleIdChange({
    upsertRecord: profileId2RelatedRuleIdRecord,
    deleteIds: deleteRelatedRuleIds,
  });
  await handleRegistrationErrorMessageChange({
    upsertRecord: profileId2ErrorRecord,
    deleteIds: deleteErrorMessageIds,
  });
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
    })).catch(error => ({
      success: false,
      profileId: deletedProfile.id,
      error,
    }));
    results.push(result);
  }

  return results;
}

async function upsertRules(changes: Pick<ProfileChanges, "created" | "modified">) {
  const results: RuleUpdateResult[] = [];
  const profilesToRegister = [...changes.created, ...changes.modified];
  const registrationRecord = await profileId2RelatedRuleIdRecordItem.getValue();

  for (const profile of profilesToRegister) {
    const condition = buildCondition(profile);
    const ruleScope = deriveRuleScope(condition);
    // Treat creation as an upsert too. A full re-registration and a queued
    // profile-created event can otherwise register the same profile twice.
    const previousRegistration = registrationRecord[profile.id];
    const rule = {
      id: await getNewRuleId(ruleScope),
      priority: profile.priority ?? 1,
      condition,
      action: buildAction(profile),
    } as const satisfies Browser.declarativeNetRequest.Rule;

    let previousRuleRemoved = false;
    if (previousRegistration && previousRegistration.ruleScope !== ruleScope) {
      await updateScopedRules(previousRegistration.ruleScope, {
        removeRuleIds: [previousRegistration.ruleId],
      });
      previousRuleRemoved = true;
    }
    try {
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
        await updateScopedRules(ruleScope, {
          removeRuleIds: [previousRegistration.ruleId],
        });
        previousRuleRemoved = true;
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

async function getNewRuleId(ruleScope: RuleScope) {
  const existingRules = await getScopedRules(ruleScope);
  return findMissingPositive(existingRules.map(rule => rule.id));
}

function findMissingPositive(numbers: number[]) {
  const set = new Set(numbers);
  let i = 1;
  while (set.has(i)) i++;
  return i;
}

function getScopedRules(ruleScope: RuleScope) {
  return match(ruleScope)
    .with("dynamic", () => browser.declarativeNetRequest.getDynamicRules())
    .with("session", () => browser.declarativeNetRequest.getSessionRules())
    .exhaustive();
}

function updateScopedRules(
  ruleScope: RuleScope,
  options: Browser.declarativeNetRequest.UpdateRuleOptions,
) {
  return match(ruleScope)
    .with("dynamic", () => browser.declarativeNetRequest.updateDynamicRules(options))
    .with("session", () => browser.declarativeNetRequest.updateSessionRules(options))
    .exhaustive();
}

function createRuleScopeRecord<T>(getValue: (ruleScope: RuleScope) => T): Record<RuleScope, T> {
  return {
    dynamic: getValue("dynamic"),
    session: getValue("session"),
  };
}

/**
 * Repairs the non-atomic boundary between DNR storage and extension storage.
 *
 * The service worker can stop after a DNR update succeeds but before the
 * corresponding profile-to-rule mapping is persisted (or vice versa). DNR
 * rules survive that restart, so reconcile both sides after every update and
 * whenever the worker starts.
 */
export async function reconcileRuleRegistrationState(registerableProfileIds: Iterable<string>) {
  const [dynamicRules, sessionRules, registrationRecord] = await Promise.all([
    browser.declarativeNetRequest.getDynamicRules(),
    browser.declarativeNetRequest.getSessionRules(),
    profileId2RelatedRuleIdRecordItem.getValue(),
  ]);
  const rulesByScope = {
    dynamic: dynamicRules,
    session: sessionRules,
  } satisfies Record<RuleScope, Browser.declarativeNetRequest.Rule[]>;
  const rulesById = createRuleScopeRecord(ruleScope =>
    new Map(rulesByScope[ruleScope].map(rule => [rule.id, rule])),
  );
  const registerableProfileIdSet = new Set(registerableProfileIds);
  const validRegistrationRecord = Object.fromEntries(
    Object.entries(registrationRecord).filter(([profileId, registration]) => {
      const rule = rulesById[registration.ruleScope].get(registration.ruleId);
      return registerableProfileIdSet.has(profileId)
        && rule !== undefined
        && deriveRuleScope(rule.condition) === registration.ruleScope;
    }),
  );
  const registeredRuleIds = createRuleScopeRecord(() => new Set<number>());
  for (const registration of Object.values(validRegistrationRecord)) {
    registeredRuleIds[registration.ruleScope].add(registration.ruleId);
  }

  // Keep stale mappings until their rules are definitely gone. If DNR removal
  // fails, the next reconciliation can still identify and retry those rules.
  const operations = RULE_SCOPES.flatMap((ruleScope) => {
    const unrelatedRuleIds = rulesByScope[ruleScope]
      .map(rule => rule.id)
      .filter(ruleId => !registeredRuleIds[ruleScope].has(ruleId));
    return unrelatedRuleIds.length > 0
      ? [updateScopedRules(ruleScope, { removeRuleIds: unrelatedRuleIds })]
      : [];
  });
  await Promise.all(operations);

  if (!isEqual(registrationRecord, validRegistrationRecord)) {
    await profileId2RelatedRuleIdRecordItem.setValue(validRegistrationRecord);
  }
  return validRegistrationRecord;
}
