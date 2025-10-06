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

type Filter = {
  [K in keyof Browser.declarativeNetRequest.RuleCondition]?: {
    value: Exclude<Browser.declarativeNetRequest.RuleCondition[K], undefined>;
    enabled: boolean;
  }
};

export interface Profile {
  requestHeaderMods: HeaderMod[];
  responseHeaderMods: HeaderMod[];
  filters: Filter;
  id: UUID;
  name: string;
  enabled: boolean;
  emoji: string;
}

export interface ProfileManager {
  profiles: Profile[];
  selectedProfileId: UUID;
  /**
   * Remember to increment wherever it is used.
   */
  modIdCounter: number;
}

interface CreateProfileOptions {
  modId: number;
  profilesLength?: number;
  emoji?: string;
  name?: string;
  id?: UUID;
}
export function createProfile({
  modId,
  profilesLength = 0,
  emoji = "📃",
  name = `New Profile ${profilesLength + 1}`,
  id,
}: CreateProfileOptions) {
  return {
    id: id ?? crypto.randomUUID(),
    name,
    enabled: true,
    emoji,
    requestHeaderMods: [{
      id: modId,
      enabled: true,
      name: "",
      value: "",
      operation: "set",
    }],
    responseHeaderMods: [],
    filters: {},
  } as const satisfies Profile;
}

export function createDefaultProfileManager() {
  const modIdCounter = 1;
  const profile = createProfile({
    modId: modIdCounter,
  });
  return {
    profiles: [profile],
    selectedProfileId: profile.id,
    modIdCounter,
  } as const satisfies ProfileManager;
}

const defaultProfileManager = createDefaultProfileManager();

export interface ProfileManager {
  profiles: Profile[];
  selectedProfileId: UUID;
}

export function useProfileManagerStorage(onReady?: (value: ProfileManager) => void) {
  return useBrowserStorage<ProfileManager>("local:profileManager", defaultProfileManager, onReady);
}

export function usePowerOnStorage() {
  return useBrowserStorage<boolean>("local:powerOn", true);
}

export type Theme = "light" | "dark" | "auto";
export function useThemeStorage() {
  return useBrowserStorage<Theme>("local:theme", "auto");
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
