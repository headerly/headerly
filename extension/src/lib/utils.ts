import type { ClassValue } from "clsx";
import type { GroupItem, GroupType, HeaderMod, Profile, RedirectUrlGroupItem, RuleActionType, SyncCookie } from "./schema";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function createSyncCookie(overrides?: Partial<SyncCookie>) {
  return {
    id: uuidv7(),
    enabled: true,
    domain: "",
    name: "",
    value: "",
    path: "/",
    ...(overrides ?? {}),
  } as const satisfies SyncCookie;
}

export function createHeaderMod(overrides?: Partial<HeaderMod>) {
  return {
    id: uuidv7(),
    enabled: true,
    name: "",
    operation: "set" as const,
    value: "",
    ...(overrides ?? {}),
  } as const satisfies HeaderMod;
}

export function createRedirectUrl(overrides?: Partial<RedirectUrlGroupItem>) {
  return {
    id: uuidv7(),
    enabled: true,
    value: "",
    ...(overrides ?? {}),
  } as const satisfies RedirectUrlGroupItem;
}

export function createProfile(overrides?: Partial<Profile>) {
  const ruleActionType = overrides?.ruleActionType ?? "modifyHeaders";

  return {
    id: uuidv7(),
    name: "New Profile 1",
    enabled: true,
    emoji: "📃",
    ruleScope: "dynamic",
    ruleActionType,
    filters: {
      urlFilter: [{
        id: uuidv7(),
        enabled: true,
        value: "",
      }],
    },
    ...(match(ruleActionType)
      .with("modifyHeaders", () => ({
        requestHeaderModGroups: [{
          id: uuidv7(),
          type: "checkbox",
          items: [createHeaderMod()],
        }],
      }))
      .with("redirect", () => ({
        redirectUrlGroup: [createRedirectUrl()],
      }))
      .otherwise(() => ({}))),
    ...overrides,
  } as const satisfies Profile;
}

/**
 * Add a new item to a group list and set the correct enabled state.
 * - checkbox: the new item is enabled directly.
 * - radio: the new item becomes the only enabled item (others are disabled).
 */
export function addItemToGroup<T extends GroupItem>(list: T[], item: T, type: GroupType) {
  if (type === "radio") {
    list.forEach(existing => existing.enabled = false);
  }
  item.enabled = true;
  list.push(item);
}

export function useRuleActionTypeLabelKey(type: RuleActionType) {
  const { t } = useI18n();
  const typeMap = {
    modifyHeaders: t("ruleAction.modifyHeaders"),
    block: t("ruleAction.block"),
    allow: t("ruleAction.allow"),
    upgradeScheme: t("ruleAction.upgradeScheme"),
    allowAllRequests: t("ruleAction.allowAllRequests"),
    redirect: t("ruleAction.redirect"),
  } as const;
  return typeMap[type];
}

export function getRuleActionTypeIcon(type: RuleActionType) {
  const iconMap = {
    modifyHeaders: "i-lucide-zap",
    block: "i-lucide-ban",
    allow: "i-lucide-shield-check",
    upgradeScheme: "i-lucide-lock",
    allowAllRequests: "i-lucide-shield",
    redirect: "i-lucide-corner-right-down",
  } as const;
  return iconMap[type];
}
