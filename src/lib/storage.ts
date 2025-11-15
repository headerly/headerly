import type { EmojiCategoryKey } from "#/constants/emoji";
import type { SerializerAsync, StorageLikeAsync } from "@vueuse/core";
import type { HeaderMod, Profile, ProfileManager, SyncCookie } from "./type";
import { useStorageAsync } from "@vueuse/core";
import { toRaw } from "vue";

function useBrowserStorage<T>(key: StorageItemKey, initialValue: T, onReady?: (value: T) => void) {
  const item = storage.defineItem<T>(key, {
    fallback: initialValue,
  });

  const ref = useStorageAsync<T>(
    key,
    initialValue,
    {
      setItem(_, value) {
        // chrome.storage stores the proxy array and converts it to a object representation. This breaks everything.
        // We need to store the original array in the proxy.
        // Note that this will still be broken if only some of the keys on the object are proxies!
        return item.setValue(toRaw(value as T));
      },
      getItem() {
        return item.getValue();
      },
      removeItem() {
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

export function createSyncCookie(overrides?: Partial<SyncCookie>) {
  return {
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
    name: "New Profile 1",
    enabled: true,
    emoji: "📃",
    requestHeaderModGroups: [{
      id: crypto.randomUUID(),
      type: "checkbox",
      items: [createMod()],
    }],
    responseHeaderModGroups: [],
    syncCookieGroups: [],
    filters: {},
    comments: "",
    relatedRuleId: 0,
    errorMessage: "",
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
  return useBrowserStorage<boolean>("local:autoAssignEmoji", true);
}

export function useRandomEmojiCategoryStorage() {
  return useBrowserStorage<EmojiCategoryKey>("local:randomEmojiCategory", "foodDrink");
}

export function useLanguageStorage() {
  return useBrowserStorage<string>("local:language", "en-US");
}

export function useEnableMetaNumberShortcutStorage() {
  return useBrowserStorage<boolean>("local:enableCtrlNumberShortcut", true);
}

export function useEnableMetaKSearchStorage() {
  return useBrowserStorage<boolean>("local:enableCtrlKSearch", true);
}

export function useEnableUndoAndRedoShortcutStorage() {
  return useBrowserStorage<boolean>("local:enableUndoAndRedoShortcut", true);
}

export function useDisplayNumberBadgeStorage() {
  return useBrowserStorage<boolean>("local:displayNumberBadge", false);
}

export function useSwitchModeStorage() {
  return useBrowserStorage<"multiple" | "single">("local:switchMode", "multiple");
}
