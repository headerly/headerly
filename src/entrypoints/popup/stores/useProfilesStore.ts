import type { UUID } from "node:crypto";
import type { Entries } from "type-fest";
import type { ActionType, GroupType, HeaderModGroup, Profile } from "@/lib/type";
import { onMessage } from "##/background/message";
import { allEmojis, emoji } from "#/constants/emoji";
import { useDebouncedRefHistory } from "@vueuse/core";
import { random, round } from "es-toolkit";
import { defineStore } from "pinia";
import { computed, ref, toRaw, watch } from "vue";
import { createMod, createProfile, createSyncCookie, useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage, useProfileManagerStorage } from "@/lib/storage";
import { useSettingsStore } from "./useSettingsStore";

function getProfileIcon() {
  const settingsStore = useSettingsStore();
  if (settingsStore.autoAssignEmoji === false) {
    return "📃";
  }
  return settingsStore.randomEmojiCategory === "all"
    ? allEmojis[round(random(allEmojis.length))]
    : emoji[settingsStore.randomEmojiCategory][round(random(emoji[settingsStore.randomEmojiCategory].length))];
}

export function findHeaderModGroups(profile: Profile, type: ActionType) {
  return type === "request"
    ? profile.requestHeaderModGroups
    : profile.responseHeaderModGroups;
}

export function findHeaderModGroup(profile: Profile, type: ActionType, groupId: UUID): HeaderModGroup | undefined {
  const groups = findHeaderModGroups(profile, type);
  return groups.find(g => g.id === groupId);
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
  const { ref: manager } = useProfileManagerStorage(managerResolve);
  const { ref: profileId2ErrorMessageRecord } = useProfileId2ErrorMessageRecordStorage(profileId2ErrorMessageRecordResolve);
  const { ref: profileId2RelatedRuleIdRecord } = useProfileId2RelatedRuleIdRecordStorage(profileId2RelatedRuleIdRecordResolve);
  const { undo, canUndo, redo, canRedo, clear } = useDebouncedRefHistory(manager, { deep: true });
  const settingsStore = useSettingsStore();

  onMessage("unregisterAllRules", () => {
    profileId2ErrorMessageRecord.value = {};
    profileId2RelatedRuleIdRecord.value = {};
  });

  onMessage("updateProfileErrorMessage", (message) => {
    const { upsertRecord: upsertErrorMap = {}, deleteIds = [] } = message.data;
    for (const [profileId, errorMessage] of Object.entries(upsertErrorMap) as Entries<typeof upsertErrorMap>) {
      profileId2ErrorMessageRecord.value[profileId] = errorMessage;
    }
    for (const profileId of deleteIds) {
      delete profileId2ErrorMessageRecord.value[profileId];
    }
  });

  onMessage("updateProfileRelatedRuleId", (message) => {
    const { upsertRecord: upsertRuleIdMap = {}, deleteIds = [] } = message.data;
    for (const [profileId, relatedRuleId] of Object.entries(upsertRuleIdMap) as Entries<typeof upsertRuleIdMap>) {
      profileId2RelatedRuleIdRecord.value[profileId] = relatedRuleId;
    }
    for (const profileId of deleteIds) {
      delete profileId2RelatedRuleIdRecord.value[profileId];
    }
  });

  // Enforce single-switch mode by disabling other profiles when selectedProfileId changes.
  watch(() => manager.value.selectedProfileId, () => {
    if (settingsStore.switchMode === "single") {
      manager.value.profiles.forEach((profile) => {
        profile.enabled = profile.id === manager.value.selectedProfileId;
      });
    }
  });
  // Clear history when the storage is ready to avoid undoing to empty state.
  managerPromise.then(clear);

  const selectedProfile = computed(() => {
    return manager.value.profiles.find(p => p.id === manager.value.selectedProfileId)!;
  });

  function addProfile() {
    const newProfile = createProfile({
      name: `New Profile ${manager.value.profiles.length + 1}`,
      emoji: getProfileIcon(),
    });
    manager.value.profiles.push(newProfile);
    manager.value.selectedProfileId = newProfile.id;
  }

  function duplicateProfile(profileId?: UUID) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const targetProfile = manager.value.profiles.find(p => p.id === targetProfileId);
    if (!targetProfile)
      return;

    const newProfile = {
      // If `toValue` is not used here, some keys in the object will be `proxy`.
      // Putting `proxy` into chrome.storage will cause the array to become its object representation(For example: `[1]` => `{0: 1}`).
      ...toRaw(targetProfile),
      id: crypto.randomUUID(),
      name: targetProfile.name.startsWith("[Duplicated]") ? targetProfile.name : `[Duplicated] ${targetProfile.name}`,
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
      items: [mod],
    } as const satisfies HeaderModGroup;
    groups.push(newGroup);
  }

  function addSyncCookieGroup() {
    const cookie = createSyncCookie();
    selectedProfile.value.syncCookieGroups.push({
      id: crypto.randomUUID(),
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
