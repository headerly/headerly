<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../stores/useProfilesStore";
import ActionFieldset from "./ActionFieldset.vue";
import InteractiveGridPattern from "./InteractiveGridPattern.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();

const empty = computed(() =>
  profilesStore.selectedProfile.requestHeaderMods.length === 0
  && profilesStore.selectedProfile.responseHeaderMods.length === 0,
);
</script>

<template>
  <div
    v-auto-animate
    :class="cn(profilesStore.selectedProfile.enabled ? 'opacity-100' : `
      opacity-50
    `, 'h-full', className)"
  >
    <div
      v-if="empty" class="
        relative grid size-full place-content-center place-items-center gap-2
        overflow-hidden p-2
      "
    >
      <i class="i-lucide-cross size-8 text-base-content" />
      <p
        class="
          z-10 text-center text-xl font-medium tracking-tighter
          whitespace-pre-wrap text-base-content
        "
      >
        No data, please add any mods or filters first.
      </p>
      <InteractiveGridPattern
        class="
          inset-0 h-[150%] skew-y-12
          [mask-image:radial-gradient(350px_circle_at_center,white,transparent)]
        "
      />
    </div>
    <div v-else v-auto-animate class="w-full">
      <ActionFieldset v-if="profilesStore.selectedProfile.requestHeaderMods.length" type="request" />
      <ActionFieldset v-if="profilesStore.selectedProfile.responseHeaderMods.length" type="response" />
    </div>
  </div>
</template>
