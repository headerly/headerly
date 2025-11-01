<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useAddModModalStore } from "#/stores/useAddModModalStore";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { computed } from "vue";
import { cn } from "@/lib/utils";
import FiltersFieldset from "./components/FiltersFieldset.vue";
import InteractiveGridPattern from "./components/InteractiveGridPattern.vue";
import ModGroup from "./components/ModGroup/index.vue";
import SyncCookieGroup from "./components/SyncCookieGroup/index.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();

const empty = computed(() => {
  const noMods = profilesStore.selectedProfile.requestHeaderModGroups.every(
    group => group.items.length === 0,
  )
  && profilesStore.selectedProfile.responseHeaderModGroups.every(
    group => group.items.length === 0,
  )
  && profilesStore.selectedProfile.syncCookieGroups.every(
    group => group.cookies.length === 0,
  );

  const noFilters = Object.values(profilesStore.selectedProfile.filters).every(
    (filter) => {
      if (Array.isArray(filter)) {
        return filter.length === 0;
      }
      return false;
    },
  );

  return noMods && noFilters;
},
);

const settingsStore = useSettingsStore();
const disabled = computed(() => !profilesStore.selectedProfile.enabled || !settingsStore.powerOn);

const showGlobalRuleWarning = computed(() => {
  return (
    Object.keys(profilesStore.selectedProfile.filters).length === 0
    && !empty.value
    && !profilesStore.selectedProfile.ignoreGlobalWarning
  );
});

const addModModalStore = useAddModModalStore();
</script>

<template>
  <div
    v-auto-animate
    :class="cn(disabled && 'opacity-60', 'h-full flex-1', className)"
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
    <div v-else v-auto-animate class="w-full px-2 pb-2">
      <ModGroup
        v-for="{ id }, index in profilesStore.selectedProfile.requestHeaderModGroups"
        :key="id"
        v-model="profilesStore.selectedProfile.requestHeaderModGroups[index]!"
        action-type="request"
      />
      <SyncCookieGroup
        v-for="{ id }, index in profilesStore.selectedProfile.syncCookieGroups"
        :key="id"
        v-model="profilesStore.selectedProfile.syncCookieGroups[index]!"
      />
      <ModGroup
        v-for="{ id }, index in profilesStore.selectedProfile.responseHeaderModGroups"
        :key="id"
        v-model="profilesStore.selectedProfile.responseHeaderModGroups[index]!"
        action-type="response"
      />
      <FiltersFieldset v-if="Object.keys(profilesStore.selectedProfile.filters).length" />
      <div
        v-if="showGlobalRuleWarning"
        role="alert"
        class="mt-2 alert alert-soft alert-warning"
      >
        <i class="i-lucide-triangle-alert size-6" />
        <div>
          <p>This rule affects every request and might break sites.</p>
          <p>Add a condition to avoid issues.</p>
        </div>
        <div class="flex gap-1">
          <button
            class="btn btn-square btn-soft btn-sm btn-warning"
            @click="() => profilesStore.selectedProfile.ignoreGlobalWarning = true"
          >
            <i class="i-lucide-x size-4" />
          </button>
          <button
            class="btn btn-square btn-soft btn-sm btn-success"
            @click="() => {
              addModModalStore.currentTab = 'conditions';
              addModModalStore.isOpen = true;
            }"
          >
            <i class="i-lucide-plus size-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
