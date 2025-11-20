<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { Profile } from "@/lib/type";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { difference } from "es-toolkit";
import { computed } from "vue";
import { cn } from "@/lib/utils";
import AddModModal from "../Header/components/AddModModal/index.vue";
import FiltersFieldset from "./components/FiltersFieldset.vue";
import InteractiveGridPattern from "./components/InteractiveGridPattern.vue";
import ModGroup from "./components/ModGroup/index.vue";
import SyncCookieGroup from "./components/SyncCookieGroup/index.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

function hasAnyFilters(filters: Profile["filters"]) {
  const arrayKeys = ["urlFilter", "regexFilter"] as const;
  const groupKeys = ["requestDomains", "excludedRequestDomains", "initiatorDomains", "excludedInitiatorDomains"] as const;
  const baseTypeKeys = ["domainType", "isUrlFilterCaseSensitive"] as const;
  // To prevent forgetting to update the null value calculation logic.
  const keysUnion = [...arrayKeys, ...groupKeys, ...baseTypeKeys];
  if (difference(Object.keys(filters), keysUnion).length > 0) {
    throw new Error(`Unknown filter keys, please update hasAnyFilters function accordingly.`);
  }

  return arrayKeys.some(key => filters[key] && filters[key].some(f => Boolean(f.value)))
    || groupKeys.some(key => filters[key] && filters[key].items.some(f => Boolean(f.value)))
    || baseTypeKeys.some(key => Boolean(filters[key]));
}

const profilesStore = useProfilesStore();

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

  const noFilters = !hasAnyFilters(profilesStore.selectedProfile.filters);

  return noMods && noFilters;
},
);

const settingsStore = useSettingsStore();
const disabled = computed(() => !profilesStore.selectedProfile.enabled || !settingsStore.powerOn);

const showGlobalRuleWarning = computed(() => {
  const filters = profilesStore.selectedProfile.filters;
  const hasFilters = hasAnyFilters(filters);
  const hasRule = Boolean(profilesStore.profileId2RelatedRuleIdRecord[profilesStore.selectedProfile.id]);
  return !hasFilters && !empty.value && hasRule;
});

function ignoreWarning() {
  profilesStore.selectedProfile.filters.urlFilter = [
    { id: crypto.randomUUID(), enabled: true, value: "*", comments: "" },
  ];
}
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
      <div
        v-if="profilesStore.profileId2ErrorMessageRecord[profilesStore.selectedProfile.id]"
        role="alert"
        class="mt-2 alert alert-soft alert-error"
      >
        <i class="i-lucide-bug size-6" />
        <div>
          <p>This profile caused an error when registering rules.</p>
          <p>{{ profilesStore.profileId2ErrorMessageRecord[profilesStore.selectedProfile.id] }}</p>
        </div>
        <div class="flex gap-1">
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <a
                  target="_blank"
                  href="https://github.com/headerly/headerly/issues"
                  class="btn btn-square btn-ghost btn-sm btn-error"
                >
                  <i class="i-lucide-github size-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Report this issue on GitHub
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div
        v-if="showGlobalRuleWarning"
        role="alert"
        class="mt-2 alert alert-soft alert-warning"
      >
        <i class="i-lucide-triangle-alert size-6" />
        <div>
          <p>This profile affects every request and might break sites.</p>
          <p>Add a condition to avoid issues.</p>
        </div>
        <div class="flex gap-1">
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  class="btn btn-square btn-ghost btn-sm btn-warning"
                  @click="ignoreWarning"
                >
                  <i class="i-lucide-ban size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Ignore this warning
              </TooltipContent>
            </Tooltip>
            <AddModModal
              tooltip-text="Add a new condition"
              default-tab="conditions"
              class="btn btn-square btn-sm btn-warning"
            />
          </tooltipprovider>
        </div>
      </div>
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
