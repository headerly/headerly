import type { StorageLikeAsync } from "@vueuse/core";
import { useStorageAsync } from "@vueuse/core";

/**
 * The purpose is just to use `as` to resolve type errors.
 */
export function useBrowserStorage<T>(key: StorageItemKey, initialValue: T) {
  return useStorageAsync<T>(key, initialValue, storage as StorageLikeAsync, { mergeDefaults: true });
}
