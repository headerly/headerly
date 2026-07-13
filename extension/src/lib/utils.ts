import type { ClassValue } from "clsx";
import type { GroupItem, GroupType, HeaderMod, Profile, RedirectUrlGroupItem, RuleActionType, SyncCookie } from "./schema";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";
import { i18n } from "#/i18n";

export type UrlOrRegexFilterType = "urlFilter" | "regexFilter";

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
      requestDomains: {
        type: "checkbox",
        items: [{
          id: uuidv7(),
          enabled: true,
          value: "",
        }],
      },
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

async function getCurrentTabHttpUrl() {
  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!currentTab?.url) {
    return undefined;
  }

  try {
    const url = new URL(currentTab.url);
    return match(url.protocol)
      .with("http:", "https:", () => url)
      .otherwise(() => undefined);
  } catch {
    return undefined;
  }
}

export async function getCurrentTabHostname() {
  return (await getCurrentTabHttpUrl())?.hostname ?? "";
}

export async function getCurrentTabHost() {
  return (await getCurrentTabHttpUrl())?.host ?? "";
}

function escapeRegexValue(value: string) {
  return value.replaceAll(/[-\\^$*+?()|.[\]{}:]/g, "\\$&");
}

export function getDefaultFilterValueByHost(filterType: UrlOrRegexFilterType, host: string) {
  return match([filterType, Boolean(host)] as const)
    .with(["urlFilter", true], () => `||${host}/*`)
    .with(["regexFilter", true], () => `^https?:\\/\\/${escapeRegexValue(host)}\\/.*`)
    .otherwise(() => "");
}

export function getRuleActionTypeLabel(type: RuleActionType) {
  const { t } = i18n.global;
  return match(type)
    .with("modifyHeaders", () => t("ruleAction.modifyHeaders"))
    .with("block", () => t("ruleAction.block"))
    .with("allow", () => t("ruleAction.allow"))
    .with("upgradeScheme", () => t("ruleAction.upgradeScheme"))
    .with("allowAllRequests", () => t("ruleAction.allowAllRequests"))
    .with("redirect", () => t("ruleAction.redirect"))
    .exhaustive();
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

export async function ensureCookiesPermission() {
  const hasCookiesPermission = await browser.permissions.contains({ permissions: ["cookies"] });
  if (hasCookiesPermission) {
    return true;
  }

  return await browser.permissions.request({ permissions: ["cookies"] });
}
