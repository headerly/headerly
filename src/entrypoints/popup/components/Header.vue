<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../useProfilesStore";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const store = useProfilesStore();

function openInFullscreen() {
  browser.tabs.create({ url: "popup.html" });
}
</script>

<template>
  <header
    :class="cn(`
      flex items-center justify-between gap-1 bg-base-200 py-1 pr-1 pl-2
    `, className)"
  >
    <div class="font-bold">
      {{ store.selectedProfile?.name }}
    </div>
    <div
      v-if="store.selectedProfile"
      class="flex items-center justify-between gap-1 bg-base-200 p-1"
    >
      <input
        v-model="store.selectedProfile.enabled"
        type="checkbox"
        class="btn tooltip-left btn-square btn-ghost btn-sm"
      >
      <button
        class="tooltip btn tooltip-left btn-square btn-ghost btn-sm btn-primary"
        data-tip="Add new request header mod"
        @click="store.addRequestHeaderMod('set')"
      >
        <i class="i-lucide-plus size-4" />
      </button>
      <button
        class="tooltip btn tooltip-left btn-square btn-ghost btn-sm btn-error"
        data-tip="Delete current profile"
        @click="store.deleteProfile"
      >
        <i class="i-lucide-trash size-4" />
      </button>
      <button
        class="tooltip btn tooltip-left btn-square btn-soft btn-sm"
        data-tip="Open in fullscreen"
        @click="openInFullscreen"
      >
        <i class="i-lucide-maximize-2 size-4" />
      </button>
    </div>
  </header>
</template>
