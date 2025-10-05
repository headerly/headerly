import type { SerializerAsync, StorageLikeAsync } from "@vueuse/core";
import type { UUID } from "node:crypto";
import type { Theme } from "@/entrypoints/popup/constants/themes";
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
        return item.getValue();
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
  };
}

export interface HeaderMod {
  /**
   * Directly corresponds to the id of the browser.declarativeNetRequest dynamic rules.
   * Must be a number(>=1); UUID cannot be used.
   */
  id: number;
  enabled: boolean;
  name: string;
  value: string;
  operation: HeaderModOperation;
  comments?: string;
}

export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];

export interface Profile {
  requestHeaderMods: HeaderMod[];
  responseHeaderMods: HeaderMod[];
  id: UUID;
  name: string;
  enabled: boolean;
  emoji: string;
}

export interface ProfileManager {
  profiles: Profile[];
  profileOrder: UUID[];
  selectedProfileId: UUID;
  /**
   * Remember to increment wherever it is used.
   */
  modIdCounter: number;
}

export function createProfile(modId: number, profilesLength = 0) {
  return {
    id: crypto.randomUUID(),
    name: `New Profile ${profilesLength + 1}`,
    enabled: true,
    emoji: "📃",
    requestHeaderMods: [{
      id: modId,
      enabled: true,
      name: "",
      value: "",
      operation: "set",
    }],
    responseHeaderMods: [],
  } as const satisfies Profile;
}

export function createDefaultProfileManager() {
  const modIdCounter = 1;
  const profile = createProfile(modIdCounter);
  return {
    profiles: [profile],
    profileOrder: [profile.id],
    selectedProfileId: profile.id,
    modIdCounter,
  } as const satisfies ProfileManager;
}

const defaultProfileManager = createDefaultProfileManager();

export interface ProfileManager {
  profiles: Profile[];
  profileOrder: UUID[];
  selectedProfileId: UUID;
}

export function useProfileManagerStorage(onReady?: (value: ProfileManager) => void) {
  return useBrowserStorage<ProfileManager>("local:profileManager", defaultProfileManager, onReady);
}

export function usePowerOnStorage() {
  return useBrowserStorage<boolean>("local:powerOn", true);
}

export function useThemeStorage() {
  return useBrowserStorage<Theme>("local:theme", "light");
}

export function useRandomEmojiStorage() {
  return useBrowserStorage<boolean>("local:randomEmoji", false);
}
