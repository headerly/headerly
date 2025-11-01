import type { EmojiCategoryKey } from "#/constants/emoji";
import type { SerializerAsync, StorageLikeAsync } from "@vueuse/core";
import type { HeaderMod, Profile, ProfileManager, SyncCookie } from "./type";
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
      items: [createMod()],
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
