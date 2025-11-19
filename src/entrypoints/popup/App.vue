<script setup lang="ts">
import { Toaster } from "vue-sonner";
import { useSettingsStore } from "./stores/useSettingsStore";
import "vue-sonner/style.css";

const settingsStore = useSettingsStore();
</script>

<template>
  <div
    class="flex h-120 w-150 items-center justify-center outline-2"
  >
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
    <Toaster :theme="settingsStore.theme" rich-colors />
  </div>
</template>
