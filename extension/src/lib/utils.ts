import type { ClassValue } from "clsx";
import type { HeaderMod, Profile, SyncCookie } from "./schema";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { uuidv7 } from "uuidv7";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const macRegex = /Macintosh;/;
export function getModKey() {
  const isMac = navigator.userAgent.match(macRegex);
  return isMac ? "⌘" : "Ctrl";
}

export function createSyncCookie(overrides?: Partial<SyncCookie>) {
  return {
    id: uuidv7(),
    enabled: true,
    domain: "",
    name: "",
    value: "",
    path: "/",
    comments: "",
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
    comments: "",
    ...(overrides ?? {}),
  } as const satisfies HeaderMod;
}

export function createProfile(overrides?: Partial<Profile>) {
  return {
    id: uuidv7(),
    name: "New Profile 1",
    enabled: true,
    emoji: "📃",
    ruleScope: "dynamic",
    ruleActionType: "modifyHeaders",
    requestHeaderModGroups: [{
      id: uuidv7(),
      type: "checkbox",
      items: [createMod()],
    }],
    filters: {},
    comments: "",
    ...(overrides ?? {}),
  } as const satisfies Profile;
}
