<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Toaster } from "vue-sonner";
import { useSettingsStore } from "./stores/useSettingsStore";
import "vue-sonner/style.css";

/**
 * Prevents transitions when the page is first opened.
 * Note that the conventional `await router.isReady` solution
 * will result in a white screen when placed in `main.ts` as a top-level await.
 */
const showTransition = ref(false);
const router = useRouter();
onMounted(async () => {
  await router.isReady();
  showTransition.value = true;
});

const settingsStore = useSettingsStore();
</script>

<template>
  <div
    class="flex h-120 w-150 items-center justify-center outline-2"
  >
    <RouterView v-slot="{ Component, route }">
      <Transition
        v-if="showTransition"
        enter-active-class="transition-all duration-100 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-100 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
        mode="out-in"
      >
        <Component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <Toaster :theme="settingsStore.theme" rich-colors />
  </div>
</template>
