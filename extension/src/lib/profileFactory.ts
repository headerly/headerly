import type { HeaderMod, Profile, RedirectUrlGroupItem, SyncCookie } from "./schema";
import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";

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
          type: "checkbox" as const,
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
