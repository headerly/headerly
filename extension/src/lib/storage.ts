import type { SerializerAsync, StorageLikeAsync, UseStorageOptions } from "@vueuse/core";
import type { WxtStorageItemOptions } from "wxt/utils/storage";
import type { SupportLocale } from "#/i18n";
import type { ProfileGroup } from "./schema";
import type { ProfileManager } from "./types";
import { useDebounceFn, useStorage, useStorageAsync } from "@vueuse/core";
import { isEqual } from "es-toolkit";
import { match } from "ts-pattern";
import { toRaw } from "vue";
import { SUPPORT_LOCALES } from "#/i18n";
import { PROFILE_GROUP_COLOR_PRESETS } from "./const";
import { createProfile } from "./profileFactory";

export { PROFILE_LATEST_VERSION } from "./const";

interface UseExtensionStorageOptions<T> {
  onReady?: (value: T) => void;
  version?: number;
  migrations?: WxtStorageItemOptions<T>["migrations"];
}

/**
 * Synchronizes a WXT `chrome.storage` item with VueUse's reactive storage API.
 *
 * Use this helper for storage values that are shared across extension contexts
 * such as the background service worker and popup pages, so both the direct
 * WXT storage item and the Vue reactive ref stay in sync.
 */
function useExtensionStorage<T>(key: StorageItemKey, initialValue: T, options?: UseExtensionStorageOptions<T>) {
  const item = storage.defineItem<T>(key, {
    fallback: initialValue,
    version: options?.version,
    migrations: options?.migrations,
  });

  // Writing to `chrome.storage` is an asynchronous operation;
  // performing a large number of writes within a short timeframe will lead to conflicts!
  const setValue = useDebounceFn((value: T) => {
    // chrome.storage stores the proxy array and converts it to a object representation. This breaks everything.
    // We need to store the original array in the proxy.
    // Note that this will still be broken if only some of the keys on the object are proxies!
    item.setValue(toRaw(value));
  }, 200);

  const ref = useStorageAsync<T>(
    key,
    initialValue,
    {
      setItem(_, value) {
        return setValue(value as T);
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
      onReady: options?.onReady,
    },
  );

  // Ensure data synchronization between multiple tab pages to avoid data inconsistency
  item.watch((newValue) => {
    if (!isEqual(toRaw(ref.value), newValue)) {
      ref.value = newValue;
    }
  });

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

/**
 * Creates a VueUse-backed `localStorage` ref for UI-only preferences.
 *
 * Use this helper when a storage value is only consumed by user interface
 * contexts, such as popup pages, to avoid unnecessary `chrome.storage` usage.
 */
function useLocalStorage<T>(key: string, initialValue: T, options?: UseStorageOptions<T>) {
  return {
    ref: useStorage<T>(key, initialValue, localStorage, options),
    initialValue,
  } as const;
}

function createDefaultProfileManager() {
  const profile = createProfile();
  return {
    profiles: [profile],
    selectedProfileId: profile.id,
  } as const satisfies ProfileManager;
}

const defaultProfileManager = createDefaultProfileManager();

type UseStorageInstanceOptions<T> = Pick<UseExtensionStorageOptions<T>, "onReady">;

export function useProfileManagerStorage(options?: UseStorageInstanceOptions<ProfileManager>) {
  return useExtensionStorage<ProfileManager>("local:profileManager", defaultProfileManager, options);
}

export function useProfileGroupsStorage(options?: UseStorageInstanceOptions<ProfileGroup[]>) {
  return useExtensionStorage<ProfileGroup[]>("local:profileGroups", [], {
    ...options,
    version: 2,
    migrations: {
      2: (groups: ProfileGroup[]) => {
        const legacyColors: Record<string, string> = {
          slate: PROFILE_GROUP_COLOR_PRESETS[0],
          blue: PROFILE_GROUP_COLOR_PRESETS[1],
          red: PROFILE_GROUP_COLOR_PRESETS[2],
          yellow: PROFILE_GROUP_COLOR_PRESETS[3],
          green: PROFILE_GROUP_COLOR_PRESETS[4],
          pink: PROFILE_GROUP_COLOR_PRESETS[5],
          purple: PROFILE_GROUP_COLOR_PRESETS[6],
          cyan: PROFILE_GROUP_COLOR_PRESETS[7],
          orange: PROFILE_GROUP_COLOR_PRESETS[8],
        };

        return groups.map(group => ({
          ...group,
          color: legacyColors[group.color] ?? group.color,
        }));
      },
    },
  });
}

export function useProfileId2RelatedRuleIdRecordStorage(options?: UseStorageInstanceOptions<Record<string, number>>) {
  return useExtensionStorage<Record<string, number>>("local:profileId2RelatedRuleIdRecord", {}, options);
}

export function useProfileId2ErrorMessageRecordStorage(options?: UseStorageInstanceOptions<Record<string, string>>) {
  return useExtensionStorage<Record<string, string>>("local:profileId2ErrorMessageRecord", {}, options);
}

export function usePowerOnStorage() {
  return useExtensionStorage<boolean>("local:powerOn", true);
}

export function useNativeResourceTypeBehaviorStorage() {
  return useExtensionStorage<boolean>("local:nativeResourceTypeBehavior", false);
}

export function useLanguageStorage() {
  const browserLanguage = browser.i18n.getUILanguage().replace("_", "-");
  const initialLanguage = match(SUPPORT_LOCALES.includes(browserLanguage))
    .with(true, () => browserLanguage as SupportLocale)
    .otherwise(() => "en" as const);
  return useLocalStorage<SupportLocale>("language", initialLanguage);
}

export function useShowCommentsInlineStorage() {
  return useLocalStorage<boolean>("show-comments-inline", false);
}
