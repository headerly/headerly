import type { UUID } from "node:crypto";
import type { GroupType, HeaderModGroup, Profile } from "@/lib/storage";
import { allEmojis, emoji } from "#/constants/emoji";
import { useDebouncedRefHistory } from "@vueuse/core";
import { random, round } from "es-toolkit";
import { defineStore } from "pinia";
import { computed, watch } from "vue";
import { createMod, createProfile, useProfileManagerStorage } from "@/lib/storage";
import { useSettingsStore } from "./useSettingsStore";

export type ActionType = "request" | "response";

function getProfileIcon() {
  const settingsStore = useSettingsStore();
  if (settingsStore.autoAssignEmoji === false) {
    return "📃";
  }
  return settingsStore.randomEmojiCategory === "all"
    ? allEmojis[round(random(allEmojis.length))]
    : emoji[settingsStore.randomEmojiCategory][round(random(emoji[settingsStore.randomEmojiCategory].length))];
}

function cloneHeaderModGroupsWithNewId(groups: HeaderModGroup[]): HeaderModGroup[] {
  return groups.map(group => ({
    ...group,
    id: crypto.randomUUID(),
    mods: group.mods.map(mod => ({
      ...mod,
      id: crypto.randomUUID(),
    })),
  }));
}

export function findHeaderModGroups(profile: Profile, type: ActionType): HeaderModGroup[] {
  return type === "request"
    ? profile.requestHeaderModGroups
    : profile.responseHeaderModGroups;
}

export function findHeaderModGroup(profile: Profile, type: ActionType, groupId: UUID): HeaderModGroup | undefined {
  const groups = findHeaderModGroups(profile, type);
  return groups.find(g => g.id === groupId);
}

export const useProfilesStore = defineStore("profiles", () => {
  const { promise, resolve } = Promise.withResolvers();
  const { ref: manager } = useProfileManagerStorage(resolve);
  const { undo, canUndo, redo, canRedo, clear } = useDebouncedRefHistory(manager, { deep: true });
  // Does not provide cross-profile undo/redo capabilities.
  watch(() => manager.value.selectedProfileId, clear);

  const selectedProfile = computed(() => {
    return manager.value.profiles.find(p => p.id === manager.value.selectedProfileId)!;
  });

  function addProfile() {
    const newProfile = createProfile({
      name: `New Profile ${manager.value.profiles.length + 1}`,
      emoji: getProfileIcon(),
    });
    manager.value.profiles.unshift(newProfile);
    manager.value.selectedProfileId = newProfile.id;
  }

  function duplicateProfile() {
    const newProfile = {
      ...selectedProfile.value,
      id: crypto.randomUUID(),
      name: `[Duplicated] ${selectedProfile.value.name}`,
      requestHeaderModGroups: cloneHeaderModGroupsWithNewId(selectedProfile.value.requestHeaderModGroups),
      responseHeaderModGroups: cloneHeaderModGroupsWithNewId(selectedProfile.value.responseHeaderModGroups),
    };
    manager.value.profiles.unshift(newProfile);
    manager.value.selectedProfileId = newProfile.id;
  }

  function deleteProfile() {
    // IMPORTANT: Ensure that there is at least one profile in the storage.
    if (manager.value.profiles.length === 1) {
      const selectedProfileIndex = manager.value.profiles.findIndex(p => p.id === manager.value.selectedProfileId);
      // Don't using `Object.assign` to ensure reactivity.
      manager.value.profiles[selectedProfileIndex] = createProfile({
        id: manager.value.profiles[selectedProfileIndex]!.id,
      });
      return;
    }
    const current = manager.value.profiles.findIndex(p => p.id === manager.value.selectedProfileId);
    const prevNearestProfileId = manager.value.profiles[current - 1]?.id;
    const nextNearestProfileId = manager.value.profiles[current + 1]?.id;
    // Don't using `Array.filter` to ensure reactivity.
    manager.value.profiles.splice(current, 1);
    manager.value.selectedProfileId = prevNearestProfileId ?? nextNearestProfileId!;
  }

  function addModGroup(type: ActionType, groupType: GroupType) {
    const groups = findHeaderModGroups(selectedProfile.value, type);
    const mod = createMod();
    const newGroup = {
      id: crypto.randomUUID(),
      type: groupType,
      mods: [mod],
    } as const satisfies HeaderModGroup;
    groups.push(newGroup);
  }

  function addSyncCookieGroup() {
    const cookie = {
      id: crypto.randomUUID(),
      enabled: true,
      domain: "",
      key: "",
    } as const;
    selectedProfile.value.syncCookieGroups.push({
      id: crypto.randomUUID(),
      type: "checkbox",
      cookies: [cookie],
    });
  }

  return {
    // State
    manager,
    canUndo,
    canRedo,
    ready: promise,
    // Getters
    selectedProfile,
    // Actions
    addProfile,
    duplicateProfile,
    deleteProfile,
    addModGroup,
    addSyncCookieGroup,
    undo,
    redo,
  };
});
