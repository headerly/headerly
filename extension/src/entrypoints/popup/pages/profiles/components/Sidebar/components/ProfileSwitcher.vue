<script setup lang="tsx">
import { useEventListener } from "@vueuse/core";
import { computed, ref, useTemplateRef, watch } from "vue";
import { useScrollToProfile } from "@/composables/useScrollToProfile";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import ProfileGroupBlock from "./ProfileGroupBlock.vue";
import ProfileListItem from "./ProfileListItem.vue";

const profilesStore = useProfilesStore();

const {
  setRef,
  scrollToProfile,
} = useScrollToProfile({
  scrollTargetIdOnMounted: profilesStore.manager.selectedProfileId,
});

watch(
  () => profilesStore.manager.selectedProfileId,
  () => scrollToProfile(profilesStore.manager.selectedProfileId, "smooth"),
  // Wait for DOM to be updated, otherwise the latest DOM element cannot be accessed.
  { flush: "post" },
);

function handleSwitchProfileShortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key >= "1" && event.key <= "9") {
    event.preventDefault();
    const index = Number(event.key) - 1;
    const profiles = profilesStore.manager.profiles;
    if (index < profiles.length) {
      const profile = profiles[index]!;
      profilesStore.manager.selectedProfileId = profile.id;
    }
  }
}

useEventListener(window, "keydown", handleSwitchProfileShortcut);
const listContainer = useTemplateRef<HTMLElement>("listContainer");
const collapsedGroupIds = ref(new Set<string>());
const ungroupedProfiles = computed(() => profilesStore.manager.profiles.filter(profile => !profile.groupId));
const groupedProfileBlocks = computed(() => profilesStore.profileGroups
  .map(group => ({
    group,
    profiles: profilesStore.manager.profiles.filter(profile => profile.groupId === group.id),
  }))
  .filter(block => block.profiles.length > 0));
const hasGroupedProfiles = computed(() => groupedProfileBlocks.value.length > 0);

useSortableAndAutoAnimate({
  disabled: hasGroupedProfiles,
  listContainer,
  list: profilesStore.manager.profiles,
});

function toggleGroup(groupId: string) {
  if (collapsedGroupIds.value.has(groupId)) {
    collapsedGroupIds.value.delete(groupId);
  } else {
    collapsedGroupIds.value.add(groupId);
  }
  collapsedGroupIds.value = new Set(collapsedGroupIds.value);
}
</script>

<template>
  <div
    ref="listContainer"
    class="
      flex flex-col gap-1 overflow-y-auto px-2 py-1.25 [scrollbar-width:none]
    "
  >
    <ProfileGroupBlock
      v-for="block in groupedProfileBlocks"
      :key="block.group.id"
      :group="block.group"
      :profiles="block.profiles"
      :collapsed="collapsedGroupIds.has(block.group.id)"
      @toggle="toggleGroup(block.group.id)"
      @set-ref="setRef"
    />
    <div
      v-for="(profile, index) in ungroupedProfiles"
      :key="profile.id"
      :ref="(el) => setRef(el as HTMLDivElement | null, profile.id)"
    >
      <ProfileListItem
        :index
        :profile
        layout="icon"
      />
    </div>
  </div>
</template>
