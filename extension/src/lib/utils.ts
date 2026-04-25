import type { ClassValue } from "clsx";
import type { GroupItem, GroupType, HeaderMod, Profile, RuleActionType, SyncCookie } from "./schema";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";

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

export function createMod(overrides?: Partial<HeaderMod>) {
  return {
    id: uuidv7(),
    enabled: true,
    name: "",
    operation: "set" as const,
    value: "",
    ...(overrides ?? {}),
  } as const satisfies HeaderMod;
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
          items: [createMod()],
        }],
      }))
      // TODO: the "redirect" action type is not fully implemented yet, so we return an empty object for now. We will need to update this part once we have a clear structure for the redirect action type.
      .with("redirect", () => ({}))
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

export function getRuleActionTypeLabel(type: RuleActionType) {
  const typeMap = {
    modifyHeaders: "Modify headers",
    block: "Block",
    allow: "Allow",
    upgradeScheme: "Upgrade scheme",
    allowAllRequests: "Allow all requests",
    redirect: "Redirect",
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
