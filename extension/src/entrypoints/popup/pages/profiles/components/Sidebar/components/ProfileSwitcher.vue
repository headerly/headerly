<script setup lang="tsx">
import ProfileOption from "#/components/ProfileOption.vue";
import { useEventListener } from "@vueuse/core";
import { useTemplateRef, watch } from "vue";
import { useScrollToProfile } from "@/composables/useScrollToProfile";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import ContextMenuWithTrigger from "../../ProfileActions/ContextMenuWithTrigger.vue";

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

const settingsStore = useSettingsStore();
function handleSwitchProfileShortcut(event: KeyboardEvent) {
  if (!settingsStore.enableMetaNumberShortcut) {
    return;
  }
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
useSortableAndAutoAnimate({
  listContainer,
  list: profilesStore.manager.profiles,
});
</script>

<template>
  <div
    ref="listContainer"
    class="
      flex flex-col gap-1 overflow-y-auto px-2 py-1.25 [scrollbar-width:none]
    "
  >
    <div
      v-for="(profile, index) in profilesStore.manager.profiles"
      :key="profile.id"
      :ref="(el) => setRef(el as HTMLDivElement | null, profile.id)"
    >
      <ContextMenuWithTrigger :profile>
        <ProfileOption
          :index
          :profile
          :show-shortcut-hint="true"
          @click="profilesStore.manager.selectedProfileId = profile.id"
          @mousedown.middle.prevent="profilesStore.deleteProfile(profile.id)"
        />
      </ContextMenuWithTrigger>
    </div>
  </div>
</template>
