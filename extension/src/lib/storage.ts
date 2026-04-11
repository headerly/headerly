import type { SerializerAsync, StorageLikeAsync } from "@vueuse/core";
import type { WxtStorageItemOptions } from "wxt/utils/storage";
import type { ProfileManager } from "./types";
import type { EmojiCategoryKey } from "@/entrypoints/popup/constants/emoji";
import { useDebounceFn, useStorageAsync } from "@vueuse/core";
import { isEqual } from "es-toolkit";
import { toRaw } from "vue";
import { createProfile } from "./utils";

interface UseBrowserStorageOptions<T> {
  onReady?: (value: T) => void;
  version?: number;
  migrations?: WxtStorageItemOptions<T>["migrations"];
}

function useBrowserStorage<T>(key: StorageItemKey, initialValue: T, options?: UseBrowserStorageOptions<T>) {
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
  }, 500);

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

function createDefaultProfileManager() {
  const profile = createProfile();
  return {
    profiles: [profile],
    selectedProfileId: profile.id,
  } as const satisfies ProfileManager;
}

const defaultProfileManager = createDefaultProfileManager();

type UseStorageInstanceOptions<T> = Pick<UseBrowserStorageOptions<T>, "onReady">;

export function useProfileManagerStorage(options?: UseStorageInstanceOptions<ProfileManager>) {
  return useBrowserStorage<ProfileManager>("local:profileManager", defaultProfileManager, options);
}

export function useProfileId2RelatedRuleIdRecordStorage(options?: UseStorageInstanceOptions<Record<string, number>>) {
  return useBrowserStorage<Record<string, number>>("local:profileId2RelatedRuleIdRecord", {}, options);
}

export function useProfileId2ErrorMessageRecordStorage(options?: UseStorageInstanceOptions<Record<string, string>>) {
  return useBrowserStorage<Record<string, string>>("local:profileId2ErrorMessageRecord", {}, options);
}

export function usePowerOnStorage() {
  return useBrowserStorage<boolean>("local:powerOn", true);
}

export function useAutoAssignEmojiStorage() {
  return useBrowserStorage<boolean>("local:autoAssignEmoji", true);
}

export function useRandomEmojiCategoryStorage() {
  return useBrowserStorage<EmojiCategoryKey>("local:randomEmojiCategory", "foodDrink");
}

export function useSwitchModeStorage() {
  return useBrowserStorage<"multiple" | "single">("local:switchMode", "multiple");
}

export function useNativeResourceTypeBehaviorStorage() {
  return useBrowserStorage<boolean>("local:nativeResourceTypeBehavior", false);
}
