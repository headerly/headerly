<script setup lang="ts">
import { Toaster } from "vue-sonner";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "./stores/useSettingsStore";
import "vue-sonner/style.css";

const settingsStore = useSettingsStore();

const isPopup = browser.extension.getViews({ type: "popup" }).includes(window);
</script>

<template>
  <div
    :class="cn('flex h-screen w-screen items-center justify-center', isPopup && `
      h-120 w-150
    `)"
  >
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
    <Toaster
      :theme="settingsStore.theme === 'auto' ? 'system' : settingsStore.theme"
      rich-colors
    />
  </div>
</template>
