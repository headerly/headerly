<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ActionFieldset from "./components/ActionFieldset.vue";
import FiltersFieldset from "./components/FiltersFieldset.vue";
import InteractiveGridPattern from "./components/InteractiveGridPattern.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();

const empty = computed(() =>
  profilesStore.selectedProfile.requestHeaderMods.length === 0
  && profilesStore.selectedProfile.responseHeaderMods.length === 0
  && Object.keys(profilesStore.selectedProfile.filters).length === 0,
);

const settingsStore = useSettingsStore();
const disabled = computed(() => !profilesStore.selectedProfile.enabled || !settingsStore.powerOn);
</script>

<template>
  <div
    v-auto-animate
    :class="cn(disabled && 'opacity-60', 'h-full', className)"
  >
    <div
      v-if="empty"
      class="
        relative grid size-full place-content-center place-items-center gap-2
        overflow-hidden
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
    <div v-else v-auto-animate class="w-full p-2">
      <ActionFieldset v-if="profilesStore.selectedProfile.requestHeaderMods.length" type="request" />
      <ActionFieldset v-if="profilesStore.selectedProfile.responseHeaderMods.length" type="response" />
      <FiltersFieldset v-if="Object.keys(profilesStore.selectedProfile.filters).length" />
    </div>
  </div>
</template>
