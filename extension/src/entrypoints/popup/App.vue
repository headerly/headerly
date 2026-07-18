<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Toaster } from "vue-sonner";
import {
  GROUP_OPEN_STATES_STORAGE_KEY,
  PROFILE_GROUP_OPEN_STATES_STORAGE_KEY,
  useCleanupLocalStorageOpenStates,
} from "@/composables/useLocalStorageOpenState";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getGroupOpenStateIds } from "@/lib/openState";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "./stores/useSettingsStore";
import "vue-sonner/style.css";

const settingsStore = useSettingsStore();
const profilesStore = useProfilesStore();

// Perform cleanup during every page render.
// Prevent deleted groups from continuing to consume localStorage quota.
watch(
  () => profilesStore.ready,
  (ready) => {
    if (!ready)
      return;

    useCleanupLocalStorageOpenStates(
      profilesStore.profileGroups.map(group => group.id),
      PROFILE_GROUP_OPEN_STATES_STORAGE_KEY,
    );
    useCleanupLocalStorageOpenStates(
      getGroupOpenStateIds(profilesStore.manager.profiles),
      GROUP_OPEN_STATES_STORAGE_KEY,
    );
  },
  { immediate: true },
);

// https://github.com/headerly/headerly/issues/53
// const isPopup = browser.extension.getViews({ type: "popup" }).includes(window);
const isPopup = ref(true);

onMounted(async () => {
  isPopup.value = !(await browser.tabs.getCurrent());
});
</script>

<template>
  <div
    :class="cn('flex h-screen w-screen items-center justify-center', isPopup && `
      h-120 w-150
    `)"
  >
    <RouterView />
    <Toaster
      :theme="settingsStore.theme === 'auto' ? 'system' : settingsStore.theme"
      position="top-center"
      rich-colors
    />
  </div>
</template>
