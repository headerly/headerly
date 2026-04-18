import type { GroupType, HeaderModGroup, Profile } from "@/lib/schema";
import type { ActionType } from "@/lib/types";
import { useDebouncedRefHistory } from "@vueuse/core";
import { random, round } from "es-toolkit";
import { defineStore } from "pinia";
import { uuidv7 } from "uuidv7";
import { computed, ref } from "vue";
import { allEmojis, emoji } from "@/entrypoints/popup/constants/emoji";
import { addProfileIds, stripProfileIds } from "@/lib/schema";
import { useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage, useProfileManagerStorage } from "@/lib/storage";
import { createMod, createProfile, createSyncCookie } from "@/lib/utils";
import { useSettingsStore } from "./useSettingsStore";

function getProfileIcon() {
  const settingsStore = useSettingsStore();
  if (settingsStore.autoAssignEmoji === false) {
    return "📃";
  }
  const pool = settingsStore.randomEmojiCategory === "all"
    ? allEmojis
    : emoji[settingsStore.randomEmojiCategory];
  return pool[round(random(pool.length - 1))];
}

export function findHeaderModGroups(profile: Profile, type: ActionType) {
  return type === "request"
    ? profile.requestHeaderModGroups
    : profile.responseHeaderModGroups;
}

export const useProfilesStore = defineStore("profiles", () => {
  const { promise: managerPromise, resolve: managerResolve } = Promise.withResolvers();
  const { promise: profileId2ErrorMessageRecordPromise, resolve: profileId2ErrorMessageRecordResolve } = Promise.withResolvers();
  const { promise: profileId2RelatedRuleIdRecordPromise, resolve: profileId2RelatedRuleIdRecordResolve } = Promise.withResolvers();
  const ready = ref(false);
  Promise.all([
    managerPromise,
    profileId2ErrorMessageRecordPromise,
    profileId2RelatedRuleIdRecordPromise,
  ]).then(() => ready.value = true);
  const { ref: manager } = useProfileManagerStorage({ onReady: managerResolve });
  const { ref: profileId2ErrorMessageRecord } = useProfileId2ErrorMessageRecordStorage({ onReady: profileId2ErrorMessageRecordResolve });
  const { ref: profileId2RelatedRuleIdRecord } = useProfileId2RelatedRuleIdRecordStorage({ onReady: profileId2RelatedRuleIdRecordResolve });
  const { undo, canUndo, redo, canRedo, clear } = useDebouncedRefHistory(manager, { deep: true });

  // Clear history when the storage is ready to avoid undoing to empty state.
  managerPromise.then(clear);

  const selectedProfile = computed(() => {
    return manager.value.profiles.find(p => p.id === manager.value.selectedProfileId)!;
  });

  function addProfile(profile?: Profile) {
    const newProfile = createProfile({
      name: `New Profile ${manager.value.profiles.length + 1}`,
      emoji: getProfileIcon(),
    });
    manager.value.profiles.push(profile ?? newProfile);
    manager.value.selectedProfileId = (profile ?? newProfile).id;
  }

  function duplicateProfile(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const targetProfile = manager.value.profiles.find(p => p.id === targetProfileId);
    if (!targetProfile)
      return;

    // Using `stripProfileIds` and `addProfileIds` ensures deep cloning and generation of fresh UUIDs for nested arrays.
    const newProfile = addProfileIds(stripProfileIds(targetProfile));
    const targetIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    manager.value.profiles.splice(targetIndex + 1, 0, newProfile);
    manager.value.selectedProfileId = newProfile.id;
  }

  function deleteProfile(profileId?: string) {
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

  function toggleProfileEnabled(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const targetProfile = manager.value.profiles.find(p => p.id === targetProfileId);
    if (targetProfile) {
      targetProfile.enabled = !targetProfile.enabled;
    }
  }

  function moveProfileUp(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);

    // Can't move up if it's already the first profile
    if (currentIndex <= 0)
      return;

    const targetProfile = manager.value.profiles[currentIndex]!;
    manager.value.profiles.splice(currentIndex, 1);
    manager.value.profiles.splice(currentIndex - 1, 0, targetProfile);
  }

  function moveProfileDown(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);

    // Can't move down if it's already the last profile
    if (currentIndex === -1 || currentIndex >= manager.value.profiles.length - 1)
      return;

    const targetProfile = manager.value.profiles[currentIndex]!;
    manager.value.profiles.splice(currentIndex, 1);
    manager.value.profiles.splice(currentIndex + 1, 0, targetProfile);
  }

  function canMoveProfileUp(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    return currentIndex > 0;
  }

  function canMoveProfileDown(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const currentIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    return currentIndex !== -1 && currentIndex < manager.value.profiles.length - 1;
  }

  function addModGroup(type: ActionType, groupType: GroupType) {
    const profile = selectedProfile.value;
    if (type === "request") {
      profile.requestHeaderModGroups ??= [];
    } else {
      profile.responseHeaderModGroups ??= [];
    }
    const groups = findHeaderModGroups(profile, type)!;
    const mod = createMod();
    const newGroup = {
      id: uuidv7(),
      type: groupType,
      items: [mod],
    } as const satisfies HeaderModGroup;
    groups.push(newGroup);
  }

  function addSyncCookieGroup() {
    const cookie = createSyncCookie();
    selectedProfile.value.syncCookieGroups ??= [];
    selectedProfile.value.syncCookieGroups.push({
      id: uuidv7(),
      type: "checkbox",
      items: [cookie],
    });
  }

  return {
    // State
    manager,
    profileId2RelatedRuleIdRecord,
    profileId2ErrorMessageRecord,
    canUndo,
    canRedo,
    ready,
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
