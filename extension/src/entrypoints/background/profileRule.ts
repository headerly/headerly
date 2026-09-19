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
  const hasTabIds = [profile.filters.tabIds, profile.filters.excludedTabIds]
    .some(group => group?.items.some(item => item.enabled && item.value.length > 0));
  const hasTabGroups = [profile.filters.tabGroups, profile.filters.excludedTabGroups]
    .some(group => group?.items.some(item =>
      item.enabled && item.value.some(binding => binding.tabIds.length > 0),
    ));
  return hasTabIds || hasTabGroups;
}

/** Detects enabled temporary-tab filters that no longer match any live tab. */
export function hasEmptyTemporaryTabFilter(profile: Pick<Profile, "filters">) {
  const hasEmptyTabIds = [profile.filters.tabIds, profile.filters.excludedTabIds]
    .some((group) => {
      const enabledItems = group?.items.filter(item => item.enabled) ?? [];
      return enabledItems.length > 0 && enabledItems.every(item => item.value.length === 0);
    });
  const hasEmptyTabGroups = [profile.filters.tabGroups, profile.filters.excludedTabGroups]
    .some((group) => {
      const enabledItems = group?.items.filter(item => item.enabled) ?? [];
      return enabledItems.length > 0
        && enabledItems.every(item => item.value.every(binding => binding.tabIds.length === 0));
    });
  return hasEmptyTabIds || hasEmptyTabGroups;
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
          && Boolean(item.domain.trim())
          && Boolean(item.path.trim())
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
