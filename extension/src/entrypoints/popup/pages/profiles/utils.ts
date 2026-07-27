import type { Profile, RuleActionType } from "@/lib/schema";
import type { ActionType } from "@/lib/types";

const IMPLICIT_ACTION_TYPES = new Set<RuleActionType>([
  "allow",
  "allowAllRequests",
  "block",
  "upgradeScheme",
]);

export function findHeaderModGroups(profile: Profile, type: ActionType) {
  return type === "request" ? profile.requestHeaderModGroups : profile.responseHeaderModGroups;
}

export function hasImplicitAction(ruleActionType: RuleActionType) {
  return IMPLICIT_ACTION_TYPES.has(ruleActionType);
}
