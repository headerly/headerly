import type { HeaderModOperation } from "@/lib/storage";
import { head } from "es-toolkit";
import { defineStore } from "pinia";
import { createProfile, useProfileManagerStorage } from "@/lib/storage";

export const useProfilesStore = defineStore("profiles", {
  state: () => {
    const { ref: manager } = useProfileManagerStorage();
    return {
      manager,
    };
  },
  getters: {
    orderedProfiles(state) {
      const profileMap = new Map(state.manager.profiles.map(p => [p.id, p]));
      return state.manager.profileOrder
        .map(id => profileMap.get(id))
        .filter(Boolean);
    },
    selectedProfile(state) {
      return state.manager.profiles.find(p => p.id === state.manager.selectedProfileId)!;
    },
    matchedProfilesByKeyword(state) {
      return (query: string) => {
        const lowerQuery = query.toLocaleLowerCase();
        return state.manager.profiles.filter(p =>
          p.name.toLocaleLowerCase().includes(lowerQuery)
          || p.requestHeaderMods.some(mod => mod.name.toLocaleLowerCase().includes(lowerQuery) || mod.value.toLocaleLowerCase().includes(lowerQuery))
          || p.responseHeaderMods.some(mod => mod.name.toLocaleLowerCase().includes(lowerQuery) || mod.value.toLocaleLowerCase().includes(lowerQuery)),
        );
      };
    },
  },
  actions: {
    addProfile() {
      const newProfile = createProfile(++this.manager.modIdCounter, this.manager.profiles.length);
      this.manager.profiles.unshift(newProfile);
      this.manager.profileOrder.unshift(newProfile.id);
      this.manager.selectedProfileId = newProfile.id;
    },
    deleteProfile() {
      // IMPORTANT: Ensure that there is at least one profile in the storage.
      if (this.manager.profiles.length === 1) {
        const selectedProfileIndex = this.manager.profiles.findIndex(p => p.id === this.manager.selectedProfileId);
        this.manager.profiles[selectedProfileIndex] = {
          ...createProfile(++this.manager.modIdCounter),
          id: this.manager.profiles[selectedProfileIndex]!.id,
        };
        return;
      }
      const current = this.manager.profiles.findIndex(p => p.id === this.manager.selectedProfileId);
      const prevNearestProfileId = this.manager.profileOrder[current - 1];
      const nextNearestProfileId = this.manager.profileOrder[current + 1];
      this.manager.profiles = this.manager.profiles.filter(p => p.id !== this.manager.selectedProfileId);
      this.manager.profileOrder = this.manager.profileOrder.filter(id => id !== this.manager.selectedProfileId);
      this.manager.selectedProfileId = prevNearestProfileId ?? nextNearestProfileId!;
    },
    reorderProfiles(fromIndex: number, toIndex: number) {
      const removed = head(this.manager.profileOrder.splice(fromIndex, 1));
      if (removed) {
        this.manager.profileOrder.splice(toIndex, 0, removed);
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
        id: ++this.manager.modIdCounter,
        enabled: true,
        name: "",
        value: "",
        operation,
      });
    },
    switchRequestHeaderModOperation(modId: number) {
      const mod = this.selectedProfile.requestHeaderMods.find(m => m.id === modId);
      const supportedOperations = ["set", "remove"] as const satisfies HeaderModOperation[];
      if (!mod) {
        return;
      }
      mod.operation = supportedOperations.at((supportedOperations.indexOf(mod.operation) - 1))!;
    },
    deleteRequestHeaderMod(modId: number) {
      if (this.selectedProfile.requestHeaderMods) {
        this.selectedProfile.requestHeaderMods = this.selectedProfile.requestHeaderMods.filter(mod => mod.id !== modId);
      }
    },
  },
});
