import type { Profile } from "@/lib/schema";
import { match } from "ts-pattern";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

export function useBatchProfileManage(getVisibleProfiles: () => Profile[]) {
  const profilesStore = useProfilesStore();
  const { t } = useI18n();

  const batchManage = ref(false);
  const selectedProfileIds = ref<string[]>([]);

  const hasSelectedProfiles = computed(() => selectedProfileIds.value.length > 0);

  const allVisibleSelected = computed(() => {
    const visibleProfileIds = getVisibleProfiles().map(profile => profile.id);
    const selectedVisibleCount = visibleProfileIds.filter(id => selectedProfileIds.value.includes(id)).length;
    if (selectedVisibleCount === 0) {
      return false;
    }
    if (selectedVisibleCount === visibleProfileIds.length) {
      return true;
    }
    return "indeterminate";
  });

  const selectAllLabel = computed(() =>
    match(allVisibleSelected.value === false || allVisibleSelected.value === "indeterminate")
      .with(true, () => t("share.selectAll"))
      .with(false, () => t("share.unselectAll"))
      .exhaustive(),
  );

  function resetBatchManage() {
    batchManage.value = false;
    selectedProfileIds.value = [];
  }

  function updateBatchManage(value: boolean) {
    batchManage.value = value;
    if (!value) {
      selectedProfileIds.value = [];
    }
  }

  function isSelected(profileId: string) {
    return selectedProfileIds.value.includes(profileId);
  }

  function toggleProfileSelection(profileId: string, selected: boolean) {
    selectedProfileIds.value = match([selected, isSelected(profileId)] as const)
      .with([true, false], () => [...selectedProfileIds.value, profileId])
      .with([false, true], () => selectedProfileIds.value.filter(id => id !== profileId))
      .otherwise(() => selectedProfileIds.value);
  }

  function toggleSelectAllVisible() {
    const visibleProfileIds = getVisibleProfiles().map(profile => profile.id);
    if (allVisibleSelected.value === true) {
      selectedProfileIds.value = selectedProfileIds.value.filter(id => !visibleProfileIds.includes(id));
      return;
    }

    selectedProfileIds.value = Array.from(new Set([
      ...selectedProfileIds.value,
      ...visibleProfileIds,
    ]));
  }

  function deleteSelectedProfiles() {
    if (!hasSelectedProfiles.value) {
      return;
    }

    const selectedProfiles = profilesStore.manager.profiles
      .filter(profile => selectedProfileIds.value.includes(profile.id));

    if (selectedProfiles.length === profilesStore.manager.profiles.length) {
      const firstProfileId = profilesStore.manager.profiles[0]!.id;
      selectedProfileIds.value
        .filter(id => id !== firstProfileId)
        .forEach(id => profilesStore.deleteProfile(id));
      profilesStore.deleteProfile(firstProfileId);
      selectedProfileIds.value = [];
      return;
    }

    selectedProfiles.forEach(profile => profilesStore.deleteProfile(profile.id));
    selectedProfileIds.value = [];
  }

  function setSelectedProfilesEnabled(enabled: boolean) {
    profilesStore.manager.profiles
      .filter(profile => selectedProfileIds.value.includes(profile.id))
      .forEach(profile => profile.enabled = enabled);
  }

  return {
    allVisibleSelected,
    batchManage,
    hasSelectedProfiles,
    selectAllLabel,
    deleteSelectedProfiles,
    isSelected,
    resetBatchManage,
    setSelectedProfilesEnabled,
    toggleProfileSelection,
    toggleSelectAllVisible,
    updateBatchManage,
  };
}
