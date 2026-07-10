<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Toaster } from "vue-sonner";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "./stores/useSettingsStore";
import "vue-sonner/style.css";

const settingsStore = useSettingsStore();

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
