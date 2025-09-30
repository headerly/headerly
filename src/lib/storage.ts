import type { SerializerAsync, StorageLikeAsync } from "@vueuse/core";
import type { UUID } from "node:crypto";
import type { Theme } from "@/entrypoints/popup/constants/themes";
import { useStorageAsync } from "@vueuse/core";
import { toRaw } from "vue";

/**
 * The purpose is just to use `as` to resolve type errors.
 */
export function useBrowserStorage<T>(key: StorageItemKey, initialValue: T) {
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
      serializer: {
        read: v => v as unknown as T,
        write: v => v as unknown as string,
      } as SerializerAsync<T>,
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

export interface BaseHeaderMod {
  id: UUID;
  enabled: boolean;
  name: string;
  value: string;
  operation: HeaderModOperation;
}

export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];

export interface RequestHeaderMod extends BaseHeaderMod {
  // Adds a new entry for the specified header. The `append` operation is not supported for request headers.
  // https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#enum_1
  operation: Exclude<HeaderModOperation, "append">;
}

export interface ResponseHeaderMod extends BaseHeaderMod {
  operation: HeaderModOperation;
}

export interface Profile {
  requestHeaderMods: RequestHeaderMod[];
  responseHeaderMods: ResponseHeaderMod[];
  id: UUID;
  name: string;
  enabled: boolean;
  emoji: string;
}

export interface ProfileManager {
  profiles: Profile[];
  profileOrder: UUID[];
  selectedProfileId: UUID;
}

export function createProfile(id: UUID, profilesLength = 0) {
  return {
    id,
    name: `New Profile ${profilesLength + 1}`,
    enabled: true,
    emoji: "📃",
    requestHeaderMods: [{
      id: crypto.randomUUID(),
      enabled: true,
      name: "",
      value: "",
      operation: "set",
    }],
    responseHeaderMods: [],
  } as const satisfies Profile;
}

export function createDefaultProfileManager() {
  const profileId = crypto.randomUUID();
  return {
    profiles: [createProfile(profileId)],
    profileOrder: [profileId],
    selectedProfileId: profileId,
  } as const satisfies ProfileManager;
}

const defaultProfileManager = createDefaultProfileManager();

export interface ProfileManager {
  profiles: Profile[];
  profileOrder: UUID[];
  selectedProfileId: UUID;
}

export function useProfileManagerStorage() {
  return useBrowserStorage<ProfileManager>("local:profileManager", defaultProfileManager);
}

export function usePowerOnStorage() {
  return useBrowserStorage<boolean>("local:powerOn", true);
}

export function useThemeStorage() {
  return useBrowserStorage<Theme>("local:theme", "light");
}
