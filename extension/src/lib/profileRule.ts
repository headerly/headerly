import type { Profile } from "./schema";
import { match } from "ts-pattern";

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
