import type { Profile, ProfileGroup, RuleActionType } from "@/lib/schema";
import { useDebouncedRefHistory } from "@vueuse/core";
import { countBy, minBy } from "es-toolkit";
import { defineStore } from "pinia";
import { uuidv7 } from "uuidv7";
import { computed, ref } from "vue";
import { PROFILE_GROUP_COLOR_PRESETS } from "@/lib/const";
import { getCurrentTabHostname } from "@/lib/currentTab";
import { createProfile } from "@/lib/profileFactory";
import { useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage, useProfileManagerStorage } from "@/lib/storage";

export const useProfilesStore = defineStore("profiles", () => {
  const { promise: managerPromise, resolve: managerResolve } = Promise.withResolvers();
  const { promise: profileId2ErrorMessageRecordPromise, resolve: profileId2ErrorMessageRecordResolve } = Promise.withResolvers();
  const { promise: profileId2RelatedRuleIdRecordPromise, resolve: profileId2RelatedRuleIdRecordResolve } = Promise.withResolvers();
  const ready = ref(false);
  const newProfileGroupIdToEdit = ref<string>();
  const { ref: manager } = useProfileManagerStorage({ onReady: managerResolve });
  const { ref: profileId2ErrorMessageRecord } = useProfileId2ErrorMessageRecordStorage({ onReady: profileId2ErrorMessageRecordResolve });
  const { ref: profileId2RelatedRuleIdRecord } = useProfileId2RelatedRuleIdRecordStorage({ onReady: profileId2RelatedRuleIdRecordResolve });
  const { undo, canUndo, redo, canRedo, clear } = useDebouncedRefHistory(manager, { deep: true });

  const profileGroups = computed(() => manager.value.profileGroups);

  // Clear history when the storage is ready to avoid undoing to empty state.
  managerPromise.then(clear);
  Promise.all([
    managerPromise,
    profileId2ErrorMessageRecordPromise,
    profileId2RelatedRuleIdRecordPromise,
  ]).then(() => {
    ready.value = true;

    // Clean up empty profile groups on load to avoid leaving orphaned groups in storage.
    deleteEmptyProfileGroups();
  });

  const selectedProfile = computed(() => {
    return manager.value.profiles.find(p => p.id === manager.value.selectedProfileId)!;
  });

  function getProfileGroup(groupId?: string) {
    return profileGroups.value.find(group => group.id === groupId);
  }

  function deleteEmptyProfileGroups() {
    const usedGroupIds = new Set(manager.value.profiles.flatMap(profile => profile.groupId ?? []));
    for (let index = profileGroups.value.length - 1; index >= 0; index--) {
      if (!usedGroupIds.has(profileGroups.value[index]!.id)) {
        profileGroups.value.splice(index, 1);
      }
    }
  }

  async function addProfile(ruleActionType: RuleActionType, groupId?: string) {
    const currentTabHostname = await getCurrentTabHostname();
    const newProfile = createProfile({
      name: `New Profile ${manager.value.profiles.length + 1}`,
      ruleActionType,
      groupId,
      filters: {
        requestDomains: {
          type: "checkbox",
          items: [{
            id: uuidv7(),
            enabled: true,
            value: currentTabHostname,
          }],
        },
      },
    });
    manager.value.profiles.push(newProfile);
    manager.value.selectedProfileId = newProfile.id;
  }

  function deleteProfile(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;

    // IMPORTANT: Ensure that there is at least one profile in the storage.
    if (manager.value.profiles.length === 1) {
      const targetProfileIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
      const targetProfile = manager.value.profiles[targetProfileIndex]!;
      // Don't using `Object.assign` to ensure reactivity.
      manager.value.profiles[targetProfileIndex] = createProfile({
        id: targetProfile.id,
        ruleActionType: targetProfile.ruleActionType,
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
      setProfileEnabled(targetProfile.id, !targetProfile.enabled);
    }
  }

  function setProfileEnabled(profileId: string, enabled: boolean) {
    const targetProfile = manager.value.profiles.find(p => p.id === profileId);
    if (!targetProfile)
      return;

    const group = getProfileGroup(targetProfile.groupId);
    const enabledChanged = targetProfile.enabled !== enabled;
    const otherProfilesToDisable: Profile[] = [];
    if (enabled && group?.type === "radio") {
      otherProfilesToDisable.push(...manager.value.profiles.filter(
        profile => profile.groupId === group.id && profile.id !== targetProfile.id && profile.enabled,
      ));
    }

    targetProfile.enabled = enabled;
    otherProfilesToDisable.forEach(profile => profile.enabled = false);
    if (group && (enabledChanged || otherProfilesToDisable.length > 0)) {
      delete group.lastEnabledProfileIds;
    }
  }

  function createProfileGroup(overrides?: Partial<ProfileGroup>) {
    const colorUsageCounts = countBy(profileGroups.value, group => group.color);
    const leastUsedPresetColor = minBy(
      PROFILE_GROUP_COLOR_PRESETS,
      color => colorUsageCounts[color] ?? 0,
    );
    const group = {
      id: uuidv7(),
      name: "",
      color: leastUsedPresetColor,
      type: "checkbox",
      ...(overrides ?? {}),
    } as const satisfies ProfileGroup;
    profileGroups.value.push(group);
    return group;
  }

  function addProfileToGroup(profileId: string, groupId: string) {
    const profile = manager.value.profiles.find(p => p.id === profileId);
    const group = getProfileGroup(groupId);
    if (!profile || !group)
      return;

    profile.groupId = group.id;
    if (group.type === "radio" && profile.enabled) {
      setProfileEnabled(profile.id, true);
    }
  }

  function addProfileToNewGroup(profileId: string) {
    if (!manager.value.profiles.some(profile => profile.id === profileId))
      return;

    const group = createProfileGroup();
    addProfileToGroup(profileId, group.id);
    newProfileGroupIdToEdit.value = group.id;
    return group;
  }

  function removeProfileFromGroup(profileId: string) {
    const profile = manager.value.profiles.find(p => p.id === profileId);
    if (profile) {
      delete profile.groupId;
    }
  }

  return {
    // State
    manager,
    profileGroups,
    profileId2RelatedRuleIdRecord,
    profileId2ErrorMessageRecord,
    newProfileGroupIdToEdit,
    canUndo,
    canRedo,
    ready,
    // Getters
    selectedProfile,
    getProfileGroup,
    // Actions
    addProfile,
    addProfileToGroup,
    addProfileToNewGroup,
    deleteProfile,
    removeProfileFromGroup,
    toggleProfileEnabled,
    undo,
    redo,
  };
});
