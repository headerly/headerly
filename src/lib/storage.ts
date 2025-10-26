import type { EmojiCategoryKey } from "#/constants/emoji";
import type { SerializerAsync, StorageLikeAsync } from "@vueuse/core";
import type { UUID } from "node:crypto";
import { useStorageAsync } from "@vueuse/core";
import { toRaw } from "vue";

function useBrowserStorage<T>(key: StorageItemKey, initialValue: T, onReady?: (value: T) => void) {
  const item = storage.defineItem<T>(key, {
    init() {
      return initialValue;
    },
  });

  const ref = useStorageAsync<T>(
    key,
    initialValue,
    {
      setItem(_, value: T) {
        // chrome.storage stores the proxy array and converts it to a normal object. This breaks everything.
        // We need to store the original array in the proxy.
        return item.setValue(toRaw(value));
      },
      getItem(_) {
        // TODO: Remove after PR merge
        // https://github.com/wxt-dev/wxt/pull/1909
        return item.getValue()!;
      },
      removeItem(_) {
        return item.removeValue();
      },
    } as StorageLikeAsync,
    {
      mergeDefaults: true,
      // @ts-expect-error VueUse types are wrong
      serializer: {
        read: v => v,
        write: v => v,
      } as SerializerAsync<T>,
      onReady,
    },
  );
  return {
    /**
     * The reactive object returned by `useStorageAsync`. It can only be used in the webpages, not in the background.
     */
    ref,
    /**
     * The return value of WXT storage.defineItem can be used anywhere.
     */
    item,
    initialValue,
  };
}

interface BaseMod extends GroupItem {
  /**
   * Directly corresponds to the id of the browser.declarativeNetRequest dynamic rules.
   * Must be a number(>=1); UUID cannot be used.
   */
  name: string;
  operation: HeaderModOperation;
}

interface AppendOrSetMod extends BaseMod {
  operation: "append" | "set";
  value: string;
}

interface RemoveMod extends BaseMod {
  operation: "remove";
}

export type HeaderMod = AppendOrSetMod | RemoveMod;

export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];

type Filter = {
  [K in keyof Browser.declarativeNetRequest.RuleCondition]?: {
    value: Exclude<Browser.declarativeNetRequest.RuleCondition[K], undefined>;
    enabled: boolean;
  }
};

export type GroupType = "radio" | "checkbox";

export interface GroupItem {
  id: UUID;
  enabled: boolean;
  comments?: string;
}

export interface HeaderModGroup {
  id: UUID;
  type: GroupType;
  mods: HeaderMod[];
}

export interface SyncCookie extends GroupItem {
  domain: string;
  name: string;
  value: string;
  // Only used to query new cookies after the first sync.
  path: string;
}

export interface SyncCookieGroup {
  id: UUID;
  type: GroupType;
  cookies: SyncCookie[];
}

export function createSyncCookie(overrides?: Partial<SyncCookie>) {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    domain: "",
    name: "",
    value: "",
    path: "/",
    ...(overrides ?? {}),
  } as const satisfies SyncCookie;
}

export interface Profile {
  requestHeaderModGroups: HeaderModGroup[];
  responseHeaderModGroups: HeaderModGroup[];
  syncCookieGroups: SyncCookieGroup[];
  filters: Filter;
  id: UUID;
  name: string;
  enabled: boolean;
  emoji: string;
  ignoreGlobalWarning?: boolean;
}

export interface ProfileManager {
  profiles: Profile[];
  selectedProfileId: UUID;
}

export function createMod(overrides?: Partial<HeaderMod>) {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    name: "",
    operation: "set" as const,
    value: "",
    ...(overrides ?? {}),
  } as const satisfies HeaderMod;
}

export function createProfile(overrides?: Partial<Profile>) {
  return {
    id: crypto.randomUUID(),
    name: "New Profile 1",
    enabled: true,
    emoji: "📃",
    requestHeaderModGroups: [{
      id: crypto.randomUUID(),
      type: "checkbox",
      mods: [createMod()],
    }],
    responseHeaderModGroups: [],
    syncCookieGroups: [],
    filters: {},
    ...(overrides ?? {}),
  } as const satisfies Profile;
}

export function createDefaultProfileManager() {
  const profile = createProfile();
  return {
    profiles: [profile],
    selectedProfileId: profile.id,
  } as const satisfies ProfileManager;
}

const defaultProfileManager = createDefaultProfileManager();

export function useProfileManagerStorage(onReady?: (value: ProfileManager) => void) {
  return useBrowserStorage<ProfileManager>("local:profileManager", defaultProfileManager, onReady);
}

export function usePowerOnStorage() {
  return useBrowserStorage<boolean>("local:powerOn", true);
}

export type Theme = "light" | "dark" | "system";
export function useThemeStorage() {
  return useBrowserStorage<Theme>("local:theme", "system");
}

export function useAutoAssignEmojiStorage() {
  return useBrowserStorage<boolean>("local:autoAssignEmoji", false);
}

export function useRandomEmojiCategoryStorage() {
  return useBrowserStorage<EmojiCategoryKey>("local:randomEmojiCategory", "all");
}

export function useLanguageStorage() {
  return useBrowserStorage<string>("local:language", "en-US");
}

export function enableProfileShortcutStorage() {
  return useBrowserStorage<boolean>("local:enableProfileShortcut", false);
}
