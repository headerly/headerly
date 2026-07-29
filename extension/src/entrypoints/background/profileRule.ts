import type { Profile } from "@/lib/schema";
import { match } from "ts-pattern";

export const RULE_SCOPES = ["dynamic", "session"] as const;
export type RuleScope = typeof RULE_SCOPES[number];

/** Derive the ruleset after any runtime-only conditions have been applied. */
export function deriveRuleScope(condition: Browser.declarativeNetRequest.RuleCondition): RuleScope {
  return condition.tabIds !== undefined || condition.excludedTabIds !== undefined
    ? "session"
    : "dynamic";
}

export function hasTemporaryTabBinding(profile: Pick<Profile, "filters">) {
  return [profile.filters.tabIds, profile.filters.excludedTabIds]
    .some(group => group?.items.some(item => item.enabled && item.value.length > 0));
}

type ProfileActionData = Pick<
  Profile,
  | "redirectUrlGroup"
  | "requestHeaderModGroups"
  | "responseHeaderModGroups"
  | "ruleActionType"
  | "syncCookieGroups"
>;

export function hasRegisterableAction(profile: ProfileActionData) {
  return match(profile.ruleActionType)
    .with("modifyHeaders", () => {
      const hasHeaderMod = [
        ...(profile.requestHeaderModGroups ?? []),
        ...(profile.responseHeaderModGroups ?? []),
      ].some(group => group.items.some((item) => {
        if (!item.enabled || !item.name.trim()) {
          return false;
        }
        return item.operation === "remove" || Boolean(item.value.trim());
      }));
      const hasSyncCookie = profile.syncCookieGroups?.some(group =>
        group.items.some(item =>
          item.enabled
          && Boolean(item.name.trim())
          && Boolean(item.value.trim()),
        ),
      ) ?? false;
      return hasHeaderMod || hasSyncCookie;
    })
    .with("redirect", () => {
      return profile.redirectUrlGroup?.some(item =>
        item.enabled && Boolean(item.value.trim()),
      ) ?? false;
    })
    .otherwise(() => true);
}
