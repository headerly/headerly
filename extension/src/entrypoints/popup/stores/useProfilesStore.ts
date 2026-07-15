import type { GroupType, HeaderModGroup, Profile, ProfileGroup, RuleActionType } from "@/lib/schema";
import type { ActionType } from "@/lib/types";
import { useDebouncedRefHistory } from "@vueuse/core";
import { defineStore } from "pinia";
import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";
import { computed, ref } from "vue";
import { PROFILE_GROUP_COLOR_PRESETS } from "@/lib/const";
import { addProfileIds, stripProfileIds } from "@/lib/schema";
import { useProfileGroupsStorage, useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage, useProfileManagerStorage } from "@/lib/storage";
import { createHeaderMod, createProfile, createRedirectUrl, createSyncCookie, getCurrentTabHostname } from "@/lib/utils";

export function findHeaderModGroups(profile: Profile, type: ActionType) {
  return match(type)
    .with("request", () => profile.requestHeaderModGroups)
    .with("response", () => profile.responseHeaderModGroups)
    .exhaustive();
}

export const useProfilesStore = defineStore("profiles", () => {
  const { promise: managerPromise, resolve: managerResolve } = Promise.withResolvers();
  const { promise: profileGroupsPromise, resolve: profileGroupsResolve } = Promise.withResolvers();
  const { promise: profileId2ErrorMessageRecordPromise, resolve: profileId2ErrorMessageRecordResolve } = Promise.withResolvers();
  const { promise: profileId2RelatedRuleIdRecordPromise, resolve: profileId2RelatedRuleIdRecordResolve } = Promise.withResolvers();
  const ready = ref(false);
  const { ref: manager } = useProfileManagerStorage({ onReady: managerResolve });
  const { ref: profileGroups } = useProfileGroupsStorage({ onReady: profileGroupsResolve });
  const { ref: profileId2ErrorMessageRecord } = useProfileId2ErrorMessageRecordStorage({ onReady: profileId2ErrorMessageRecordResolve });
  const { ref: profileId2RelatedRuleIdRecord } = useProfileId2RelatedRuleIdRecordStorage({ onReady: profileId2RelatedRuleIdRecordResolve });
  const { undo, canUndo, redo, canRedo, clear } = useDebouncedRefHistory(manager, { deep: true });

  // Clear history when the storage is ready to avoid undoing to empty state.
  managerPromise.then(clear);
  Promise.all([
    managerPromise,
    profileGroupsPromise,
    profileId2ErrorMessageRecordPromise,
    profileId2RelatedRuleIdRecordPromise,
  ]).then(() => ready.value = true);

  const selectedProfile = computed(() => {
    return manager.value.profiles.find(p => p.id === manager.value.selectedProfileId)!;
  });

  function getProfileGroup(groupId?: string) {
    return profileGroups.value.find(group => group.id === groupId);
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

  function duplicateProfile(profileId?: string) {
    const targetProfileId = profileId ?? manager.value.selectedProfileId;
    const targetProfile = manager.value.profiles.find(p => p.id === targetProfileId);
    if (!targetProfile)
      return;

    // Using `stripProfileIds` and `addProfileIds` ensures deep cloning and generation of fresh UUIDs for nested arrays.
    const newProfile = addProfileIds(stripProfileIds(targetProfile));
    newProfile.groupId = targetProfile.groupId;
    const targetIndex = manager.value.profiles.findIndex(p => p.id === targetProfileId);
    manager.value.profiles.splice(targetIndex + 1, 0, newProfile);
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

    targetProfile.enabled = enabled;
    const group = getProfileGroup(targetProfile.groupId);
    if (enabled && group?.type === "radio") {
      manager.value.profiles
        .filter(profile => profile.groupId === group.id && profile.id !== targetProfile.id)
        .forEach(profile => profile.enabled = false);
    }
  }

  function createProfileGroup(overrides?: Partial<ProfileGroup>) {
    const group = {
      id: uuidv7(),
      name: `Group ${profileGroups.value.length + 1}`,
      color: PROFILE_GROUP_COLOR_PRESETS[0],
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
    const group = createProfileGroup();
    addProfileToGroup(profileId, group.id);
    return group;
  }

  function removeProfileFromGroup(profileId: string) {
    const profile = manager.value.profiles.find(p => p.id === profileId);
    if (profile) {
      delete profile.groupId;
    }
  }

  function updateProfileGroup(groupId: string, value: Partial<Pick<ProfileGroup, "color" | "name" | "type">>) {
    const group = getProfileGroup(groupId);
    if (!group)
      return;

    Object.assign(group, value);
    if (value.type === "radio") {
      const enabledProfiles = manager.value.profiles.filter(profile => profile.groupId === group.id && profile.enabled);
      enabledProfiles.slice(1).forEach(profile => profile.enabled = false);
    }
  }

  function deleteProfileGroup(groupId: string) {
    const groupIndex = profileGroups.value.findIndex(group => group.id === groupId);
    if (groupIndex === -1)
      return;

    profileGroups.value.splice(groupIndex, 1);
    manager.value.profiles
      .filter(profile => profile.groupId === groupId)
      .forEach(profile => delete profile.groupId);
  }

  function reorderProfilesByIds(profileIds: string[]) {
    const profilesById = new Map(manager.value.profiles.map(profile => [profile.id, profile]));
    const seenProfileIds = new Set<string>();
    const reorderedProfiles = profileIds.flatMap((profileId) => {
      const profile = profilesById.get(profileId);
      if (!profile || seenProfileIds.has(profileId)) {
        return [];
      }

      seenProfileIds.add(profileId);
      return [profile];
    });
    const remainingProfiles = manager.value.profiles.filter(profile => !seenProfileIds.has(profile.id));
    manager.value.profiles.splice(0, manager.value.profiles.length, ...reorderedProfiles, ...remainingProfiles);
  }

  function addHeaderActionGroup(type: ActionType, groupType: GroupType) {
    const profile = selectedProfile.value;
    if (type === "request") {
      profile.requestHeaderModGroups ??= [];
    } else {
      profile.responseHeaderModGroups ??= [];
    }
    const groups = findHeaderModGroups(profile, type)!;
    const mod = createHeaderMod();
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

  function addRedirectUrlGroup() {
    if (!selectedProfile.value.redirectUrlGroup?.length) {
      selectedProfile.value.redirectUrlGroup = [createRedirectUrl()];
    }
  }

  return {
    // State
    manager,
    profileGroups,
    profileId2RelatedRuleIdRecord,
    profileId2ErrorMessageRecord,
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
    createProfileGroup,
    deleteProfileGroup,
    duplicateProfile,
    deleteProfile,
    removeProfileFromGroup,
    reorderProfilesByIds,
    setProfileEnabled,
    toggleProfileEnabled,
    updateProfileGroup,
    addHeaderActionGroup,
    addSyncCookieGroup,
    addRedirectUrlGroup,
    undo,
    redo,
  };
});
