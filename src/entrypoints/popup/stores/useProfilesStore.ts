import type { UUID } from "node:crypto";
import type { GroupType, HeaderModGroup, Profile } from "@/lib/storage";
import { allEmojis, emoji } from "#/constants/emoji";
import { useDebouncedRefHistory } from "@vueuse/core";
import { random, round } from "es-toolkit";
import { defineStore } from "pinia";
import { computed } from "vue";
import { createMod, createProfile, createSyncCookie, useProfileManagerStorage } from "@/lib/storage";
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
  const { undo, canUndo, redo, canRedo } = useDebouncedRefHistory(manager, { deep: true });

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

  function duplicateProfile(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const targetProfile = manager.value.profiles.find(p => p.id === targetProfileId);
    if (!targetProfile)
      return;

    const newProfile = {
      ...targetProfile,
      id: crypto.randomUUID(),
      name: `[Duplicated] ${targetProfile.name}`,
      requestHeaderModGroups: cloneHeaderModGroupsWithNewId(targetProfile.requestHeaderModGroups),
      responseHeaderModGroups: cloneHeaderModGroupsWithNewId(targetProfile.responseHeaderModGroups),
    };

    const targetIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    manager.value.profiles.splice(targetIndex + 1, 0, newProfile);
    manager.value.selectedProfileId = newProfile.id;
  }

  function deleteProfile(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;

    // IMPORTANT: Ensure that there is at least one profile in the storage.
    if (manager.value.profiles.length === 1) {
      const targetProfileIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
      // Don't using `Object.assign` to ensure reactivity.
      manager.value.profiles[targetProfileIndex] = createProfile({
        id: manager.value.profiles[targetProfileIndex]!.id,
      });
      return;
    }

    const current = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    if (current === -1)
      return;

    const prevNearestProfileId = manager.value.profiles[current - 1]?.id;
    const nextNearestProfileId = manager.value.profiles[current + 1]?.id;

    // Don't using `Array.filter` to ensure reactivity.
    manager.value.profiles.splice(current, 1);

    // Only update selectedProfileId if we're deleting the currently selected profile
    if (targetProfileId === manager.value.selectedProfileId) {
      manager.value.selectedProfileId = prevNearestProfileId ?? nextNearestProfileId!;
    }
  }

  function toggleProfileEnabled(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const targetProfile = manager.value.profiles.find(p => p.id === targetProfileId);
    if (targetProfile) {
      targetProfile.enabled = !targetProfile.enabled;
    }
  }

  function moveProfileUp(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);

    // Can't move up if it's already the first profile
    if (currentIndex <= 0)
      return;

    const targetProfile = manager.value.profiles[currentIndex]!;
    manager.value.profiles.splice(currentIndex, 1);
    manager.value.profiles.splice(currentIndex - 1, 0, targetProfile);
  }

  function moveProfileDown(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);

    // Can't move down if it's already the last profile
    if (currentIndex === -1 || currentIndex >= manager.value.profiles.length - 1)
      return;

    const targetProfile = manager.value.profiles[currentIndex]!;
    manager.value.profiles.splice(currentIndex, 1);
    manager.value.profiles.splice(currentIndex + 1, 0, targetProfile);
  }

  function canMoveProfileUp(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    return currentIndex > 0;
  }

  function canMoveProfileDown(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    return currentIndex !== -1 && currentIndex < manager.value.profiles.length - 1;
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
    const cookie = createSyncCookie();
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
    toggleProfileEnabled,
    moveProfileUp,
    moveProfileDown,
    canMoveProfileUp,
    canMoveProfileDown,
    addModGroup,
    addSyncCookieGroup,
    undo,
    redo,
  };
});
