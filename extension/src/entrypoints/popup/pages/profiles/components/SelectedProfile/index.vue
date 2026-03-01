<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { Profile } from "@/lib/schema";

import { match } from "ts-pattern";
import { computed } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn } from "@/lib/utils";
import AlertGroup from "./components/AlertGroup.vue";
import FiltersFieldset from "./components/FiltersFieldset.vue";
import InteractiveGridPattern from "./components/InteractiveGridPattern.vue";
import ModGroup from "./components/ModGroup/index.vue";
import SyncCookieGroup from "./components/SyncCookieGroup/index.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const hasAnyFilters = computed(() => {
  const filters = profilesStore.selectedProfile.filters;
  return (Object.keys(filters) as (keyof Profile["filters"])[]).some((key) => {
    return match(key)
      .with("urlFilter", "regexFilter", (k) => {
        return filters[k]?.some(f => Boolean(f.value)) ?? false;
      })
      .with(
        "requestMethods",
        "excludedRequestMethods",
        "resourceTypes",
        "excludedResourceTypes",
        (k) => {
          return filters[k]?.some(item => item.enabled) ?? false;
        },
      )
      .with(
        "requestDomains",
        "excludedRequestDomains",
        "initiatorDomains",
        "excludedInitiatorDomains",
        (k) => {
          return filters[k]?.items.some(f => Boolean(f.value)) ?? false;
        },
      )
      .with("domainType", "isUrlFilterCaseSensitive", (k) => {
        return Boolean(filters[k]);
      })
      .exhaustive();
  });
});

const empty = computed(() => {
  const noMods = profilesStore.selectedProfile.requestHeaderModGroups.every(
    group => group.items.length === 0,
  )
  && profilesStore.selectedProfile.responseHeaderModGroups.every(
    group => group.items.length === 0,
  )
  && profilesStore.selectedProfile.syncCookieGroups.every(
    group => group.items.length === 0,
  );

  const noFilters = !hasAnyFilters.value;

  return noMods && noFilters;
},
);

const settingsStore = useSettingsStore();
const disabled = computed(() => !profilesStore.selectedProfile.enabled || !settingsStore.powerOn);
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
      <i class="i-lucide-plus size-8" />
      <p
        class="
          z-10 text-center text-xl font-medium tracking-tighter
          whitespace-pre-wrap
        "
      >
        No data, please add any mods or filters first.
      </p>
      <InteractiveGridPattern
        class="
          inset-0 h-[150%] skew-y-12
          mask-[radial-gradient(350px_circle_at_center,white,transparent)]
        "
      />
    </div>
    <div v-else v-auto-animate class="mt-2 w-full px-2 pb-2">
      <AlertGroup :empty :has-any-filters />
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
    </div>
  </div>
</template>
