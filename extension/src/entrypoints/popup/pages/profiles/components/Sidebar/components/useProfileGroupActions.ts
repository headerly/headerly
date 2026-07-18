import type { Profile, ProfileGroup } from "@/lib/schema";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

export function useProfileGroupActions(props: {
  group: ProfileGroup;
  profiles: Profile[];
}) {
  const profilesStore = useProfilesStore();
  const { t } = useI18n();
  const hasEnabledProfile = computed(() => props.profiles.some(profile => profile.enabled));
  const hasRememberedProfiles = computed(() => {
    const profileIds = new Set(props.profiles.map(profile => profile.id));
    return props.group.lastEnabledProfileIds?.some(profileId => profileIds.has(profileId)) ?? false;
  });
  const profileGroupToggleLabel = computed(() => {
    if (hasEnabledProfile.value) {
      return t("profileGroup.actions.pauseAndRemember");
    }
    if (hasRememberedProfiles.value) {
      return t("profileGroup.actions.resumeRemembered");
    }
    return t("profileGroup.actions.resume");
  });

  function updateProfileGroup(value: Partial<Pick<ProfileGroup, "color" | "name" | "type">>) {
    const group = profilesStore.getProfileGroup(props.group.id);
    if (!group)
      return;

    Object.assign(group, value);
    if (value.type !== "radio")
      return;

    const enabledProfiles = profilesStore.manager.profiles
      .filter(profile => profile.groupId === group.id && profile.enabled);
    const profilesToDisable = enabledProfiles.slice(1);
    profilesToDisable.forEach(profile => profile.enabled = false);
    if (profilesToDisable.length > 0) {
      delete group.lastEnabledProfileIds;
    }
  }

  function setGroupType(type: ProfileGroup["type"]) {
    if (type !== "radio" && type !== "checkbox")
      return;

    updateProfileGroup({ type });
  }

  function toggleProfileGroupEnabled() {
    const group = profilesStore.getProfileGroup(props.group.id);
    if (!group)
      return;

    const profiles = profilesStore.manager.profiles.filter(profile => profile.groupId === group.id);
    const enabledProfiles = profiles.filter(profile => profile.enabled);
    if (enabledProfiles.length > 0) {
      // Pausing a group records its current selection so it can be restored later.
      group.lastEnabledProfileIds = enabledProfiles.map(profile => profile.id);
      profiles.forEach(profile => profile.enabled = false);
      return;
    }

    // Without a previous selection, radio groups resume the first profile while checkbox groups
    // resume every profile.
    let defaultEnabledProfileIds = profiles.slice(0, 1).map(profile => profile.id);
    if (group.type === "checkbox") {
      defaultEnabledProfileIds = profiles.map(profile => profile.id);
    }

    // Ignore remembered profiles that have since been removed from this group.
    const profileIdSet = new Set(profiles.map(profile => profile.id));
    let rememberedProfileIds = group.lastEnabledProfileIds?.filter(profileId => profileIdSet.has(profileId));
    if (!rememberedProfileIds?.length) {
      rememberedProfileIds = defaultEnabledProfileIds;
    }
    const rememberedProfileIdSet = new Set(rememberedProfileIds);
    const firstRememberedProfile = profiles.find(profile => rememberedProfileIdSet.has(profile.id));

    profiles.forEach((profile) => {
      if (group.type === "checkbox") {
        profile.enabled = rememberedProfileIdSet.has(profile.id);
      } else {
        // Radio groups can restore at most one remembered profile.
        profile.enabled = profile.id === firstRememberedProfile?.id;
      }
    });

    group.lastEnabledProfileIds = profiles
      .filter(profile => profile.enabled)
      .map(profile => profile.id);
  }

  function deleteProfileGroup() {
    const profileIds = profilesStore.manager.profiles
      .filter(profile => profile.groupId === props.group.id)
      .map(profile => profile.id);
    profileIds.forEach(profileId => profilesStore.deleteProfile(profileId));

    const groupIndex = profilesStore.profileGroups.findIndex(group => group.id === props.group.id);
    if (groupIndex !== -1 && !profilesStore.manager.profiles.some(profile => profile.groupId === props.group.id)) {
      profilesStore.profileGroups.splice(groupIndex, 1);
    }
  }

  return {
    deleteProfileGroup,
    hasEnabledProfile,
    hasRememberedProfiles,
    profileGroupToggleLabel,
    setGroupType,
    toggleProfileGroupEnabled,
    updateProfileGroup,
  };
}
