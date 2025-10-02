import type { HeaderMod, HeaderModOperation } from "@/lib/storage";
import { useDebouncedRefHistory } from "@vueuse/core";
import { head } from "es-toolkit";
import { defineStore } from "pinia";
import { computed, watch } from "vue";
import { createProfile, useProfileManagerStorage } from "@/lib/storage";

export const useProfilesStore = defineStore("profiles", () => {
  const { ref: manager } = useProfileManagerStorage();

  const { undo, canUndo, redo, canRedo, clear } = useDebouncedRefHistory(manager, { deep: true });
  // Does not provide cross-profile undo/redo capabilities.
  watch(() => manager.value.selectedProfileId, clear);

  const orderedProfiles = computed(() => {
    const profileMap = new Map(manager.value.profiles.map(p => [p.id, p]));
    return manager.value.profileOrder
      .map(id => profileMap.get(id))
      .filter(Boolean);
  });

  const selectedProfile = computed(() => {
    return manager.value.profiles.find(p => p.id === manager.value.selectedProfileId)!;
  });

  function addProfile() {
    const newProfile = createProfile(++manager.value.modIdCounter, manager.value.profiles.length);
    manager.value.profiles.unshift(newProfile);
    manager.value.profileOrder.unshift(newProfile.id);
    manager.value.selectedProfileId = newProfile.id;
  }

  function duplicateProfile() {
    const newProfile = { ...selectedProfile.value, id: crypto.randomUUID(), name: `[Duplicated] ${selectedProfile.value.name}` };
    newProfile.requestHeaderMods = newProfile.requestHeaderMods.map(mod => ({ ...mod, id: ++manager.value.modIdCounter }));
    newProfile.responseHeaderMods = newProfile.responseHeaderMods.map(mod => ({ ...mod, id: ++manager.value.modIdCounter }));
    manager.value.profiles.unshift(newProfile);
    manager.value.profileOrder.unshift(newProfile.id);
    manager.value.selectedProfileId = newProfile.id;
  }

  function deleteProfile() {
    // IMPORTANT: Ensure that there is at least one profile in the storage.
    if (manager.value.profiles.length === 1) {
      const selectedProfileIndex = manager.value.profiles.findIndex(p => p.id === manager.value.selectedProfileId);
      // Don't using `Object.assign` to ensure reactivity.
      manager.value.profiles[selectedProfileIndex] = {
        ...createProfile(++manager.value.modIdCounter),
        id: manager.value.profiles[selectedProfileIndex]!.id,
      };
      return;
    }
    const current = manager.value.profiles.findIndex(p => p.id === manager.value.selectedProfileId);
    const prevNearestProfileId = manager.value.profileOrder[current - 1];
    const nextNearestProfileId = manager.value.profileOrder[current + 1];
    // Don't using `Array.filter` to ensure reactivity.
    manager.value.profiles.splice(current, 1);
    manager.value.profileOrder = manager.value.profileOrder.filter(id => id !== manager.value.selectedProfileId);
    manager.value.selectedProfileId = prevNearestProfileId ?? nextNearestProfileId!;
  }

  function reorderProfiles(fromIndex: number, toIndex: number) {
    const removed = head(manager.value.profileOrder.splice(fromIndex, 1));
    if (removed) {
      manager.value.profileOrder.splice(toIndex, 0, removed);
    }
  }

  function addHeaderAction(type: "request" | "response") {
    const mod = {
      id: ++manager.value.modIdCounter,
      enabled: true,
      name: "",
      value: "",
      operation: "set",
    } as const satisfies HeaderMod;
    if (type === "request") {
      selectedProfile.value.requestHeaderMods.push(mod);
    } else {
      selectedProfile.value.responseHeaderMods.push(mod);
    }
  }

  function switchRequestHeaderModOperation(modId: number) {
    const mod = selectedProfile.value.requestHeaderMods.find(m => m.id === modId);
    const supportedOperations = ["set", "append", "remove"] as const satisfies HeaderModOperation[];
    if (!mod) {
      return;
    }
    mod.operation = supportedOperations.at((supportedOperations.indexOf(mod.operation) - 1))!;
  }

  function deleteRequestHeaderMod(modId: number) {
    if (selectedProfile.value.requestHeaderMods) {
      selectedProfile.value.requestHeaderMods = selectedProfile.value.requestHeaderMods.filter(mod => mod.id !== modId);
    }
  }

  return {
    // State
    manager,
    canUndo,
    canRedo,
    // Getters
    orderedProfiles,
    selectedProfile,
    // Actions
    addProfile,
    duplicateProfile,
    deleteProfile,
    reorderProfiles,
    addHeaderAction,
    switchRequestHeaderModOperation,
    deleteRequestHeaderMod,
    undo,
    redo,
  };
});
