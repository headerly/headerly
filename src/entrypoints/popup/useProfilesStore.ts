import type { StorageLikeAsync } from "@vueuse/core";
import { useStorageAsync } from "@vueuse/core";
import { head } from "es-toolkit";
import { defineStore } from "pinia";

type UUID = ReturnType<typeof crypto.randomUUID>;
interface BaseHeaderMod {
  id: UUID;
  enabled: boolean;
  name: string;
  value: string;
  operation: HeaderModOperation;
}

type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];

interface RequestHeaderMod extends BaseHeaderMod {
  // Adds a new entry for the specified header. The `append` operation is not supported for request headers.
  // https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#enum_1
  operation: Exclude<HeaderModOperation, "append">;
}

interface ResponseHeaderMod extends BaseHeaderMod {
  operation: HeaderModOperation;
}

interface Profile {
  requestHeaderMods?: RequestHeaderMod[];
  responseHeaderMods?: ResponseHeaderMod[];
  id: UUID;
  name: string;
  enabled: boolean;
}

interface UserSettings {
  profiles: Profile[];
  profileOrder: UUID[];
  selectedProfileId?: UUID;
}

/**
 * The purpose is just to use `as` to resolve type errors.
 */
function useBrowserStorage<T>(key: StorageItemKey, initialValue: T) {
  return useStorageAsync<T>(key, initialValue, storage as StorageLikeAsync, { mergeDefaults: true });
}

export const useProfilesStore = defineStore("profiles", {
  state: () => {
    const profiles = useBrowserStorage<UserSettings["profiles"]>("local:profiles", []);
    const profileOrder = useBrowserStorage<UserSettings["profileOrder"]>("local:profileOrder", []);
    const selectedProfileId = useBrowserStorage<UserSettings["selectedProfileId"]>("local:selectedProfileId", undefined);
    return {
      profiles,
      profileOrder,
      selectedProfileId,
    };
  },
  getters: {
    orderedProfiles(state) {
      const profileMap = new Map(state.profiles.map(p => [p.id, p]));
      return state.profileOrder
        .map(id => profileMap.get(id))
        .filter(Boolean);
    },
    selectedProfile(state) {
      return state.profiles.find(p => p.id === state.selectedProfileId);
    },
    matchedProfilesByKeyword(state) {
      return (query: string) => {
        const lowerQuery = query.toLocaleLowerCase();
        return state.profiles.filter(p =>
          p.name.toLocaleLowerCase().includes(lowerQuery)
          || p.requestHeaderMods?.some(mod => mod.name.toLocaleLowerCase().includes(lowerQuery) || mod.value.toLocaleLowerCase().includes(lowerQuery))
          || p.responseHeaderMods?.some(mod => mod.name.toLocaleLowerCase().includes(lowerQuery) || mod.value.toLocaleLowerCase().includes(lowerQuery)),
        );
      };
    },
  },
  actions: {
    addProfile() {
      const newProfile: Profile = {
        id: crypto.randomUUID(),
        name: `New Profile ${this.profiles.length + 1}`,
        enabled: true,
        requestHeaderMods: [{
          id: crypto.randomUUID(),
          enabled: true,
          name: "",
          value: "",
          operation: "set",
        }],
        responseHeaderMods: [],
      };
      this.profiles.push(newProfile);
      this.profileOrder.push(newProfile.id);
      this.selectedProfileId = newProfile.id;
    },
    deleteProfile() {
      if (!this.selectedProfileId) {
        return;
      }
      this.profiles = this.profiles.filter(p => p.id !== this.selectedProfileId);
      if (this.profiles.length === 0) {
        this.addProfile();
        return;
      }
      const prevNearestProfileId = this.profileOrder[this.profileOrder.indexOf(this.selectedProfileId) - 1];
      const nextNearestProfileId = this.profileOrder[this.profileOrder.indexOf(this.selectedProfileId) + 1];
      this.profileOrder = this.profileOrder.filter(id => id !== this.selectedProfileId);
      this.selectedProfileId = prevNearestProfileId ?? nextNearestProfileId;
    },
    reorderProfiles(fromIndex: number, toIndex: number) {
      const removed = head(this.profileOrder.splice(fromIndex, 1));
      if (removed) {
        this.profileOrder.splice(toIndex, 0, removed);
      }
    },
    addRequestHeaderMod(operation: "set" | "remove") {
      if (!this.selectedProfile) {
        return;
      }
      if (!this.selectedProfile.requestHeaderMods) {
        this.selectedProfile.requestHeaderMods = [];
      }
      this.selectedProfile.requestHeaderMods.push({
        id: crypto.randomUUID(),
        enabled: true,
        name: "",
        value: "",
        operation,
      });
    },
    switchRequestHeaderModOperation(modId: UUID) {
      const mod = this.selectedProfile?.requestHeaderMods?.find(m => m.id === modId);
      const supportedOperations = ["set", "remove"] as const satisfies HeaderModOperation[];
      if (!mod) {
        return;
      }
      mod.operation = supportedOperations.at((supportedOperations.indexOf(mod.operation) - 1))!;
    },
    deleteRequestHeaderMod(modId: UUID) {
      if (this.selectedProfile?.requestHeaderMods) {
        this.selectedProfile.requestHeaderMods = this.selectedProfile.requestHeaderMods.filter(mod => mod.id !== modId);
      }
    },
  },
});
