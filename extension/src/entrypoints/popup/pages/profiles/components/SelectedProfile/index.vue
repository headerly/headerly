<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@headerly/ui/lib/utils";
import { match } from "ts-pattern";
import { computed } from "vue";
import { hasImplicitAction } from "#/pages/profiles/utils";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { getObjectKeysWithTypeAssert } from "@/lib/object";
import RequestModFieldWithActions from "./components/ActionGroup/index.vue";
import RedirectUrlGroup from "./components/ActionGroup/RedirectUrlGroup.vue";
import AlertGroup from "./components/AlertGroup.vue";
import FiltersFieldset from "./components/FiltersFieldset.vue";
import InteractiveGridPattern from "./components/InteractiveGridPattern.vue";
import ProfileWatermarkLogo from "./components/ProfileWatermarkLogo.vue";
import SyncCookieGroup from "./components/SyncCookieGroup/index.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const hasAnyNonEmptyFilters = computed(() => {
  const filters = profilesStore.selectedProfile.filters;
  return (getObjectKeysWithTypeAssert(filters)).some((key) => {
    return match(key)
      .with("urlFilter", "regexFilter", (k) => {
        return filters[k]?.some(f => Boolean(f.value) && f.enabled) ?? false;
      })
      .with(
        "requestMethods",
        "excludedRequestMethods",
        "resourceTypes",
        "excludedResourceTypes",
        "tabIds",
        "excludedTabIds",
        "tabGroups",
        "excludedTabGroups",
        (k) => {
          return filters[k]?.items.some(f => f.enabled && f.value.length > 0) ?? false;
        },
      )
      .with(
        "requestDomains",
        "excludedRequestDomains",
        "initiatorDomains",
        "excludedInitiatorDomains",
        "topDomains",
        "excludedTopDomains",
        (k) => {
          return filters[k]?.items.some(f => Boolean(f.value.trim()) && f.enabled) ?? false;
        },
      )
      .with("domainType", "isUrlFilterCaseSensitive", (k) => {
        return Boolean(filters[k]?.enabled);
      })
      .exhaustive();
  });
});

const empty = computed(() => {
  const profile = profilesStore.selectedProfile;
  const noActions = (profile.requestHeaderModGroups ?? []).every(
    group => group.items.length === 0,
  )
  && (profile.responseHeaderModGroups ?? []).every(
    group => group.items.length === 0,
  )
  && (profile.syncCookieGroups ?? []).every(
    group => group.items.length === 0,
  )
  && (profile.redirectUrlGroup ?? []).length === 0;

  const noFilters = Object.keys(profile.filters).length === 0;
  return noActions
    && noFilters
    && !hasImplicitAction(profile.ruleActionType);
});

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
        {{ $t("profile.empty") }}
      </p>
      <InteractiveGridPattern
        class="
          inset-0 h-[200%] skew-y-12
          mask-[radial-gradient(350px_circle_at_center,white,transparent)]
        "
      />
    </div>
    <div v-else class="relative min-h-full w-full">
      <ProfileWatermarkLogo
        class="
          pointer-events-none fixed right-6 bottom-6 size-8
          text-muted-foreground/35 select-none
        "
      />

      <div v-auto-animate class="relative z-10 w-full p-2">
        <AlertGroup :empty :has-any-filters="hasAnyNonEmptyFilters" />
        <RedirectUrlGroup
          v-if="profilesStore.selectedProfile.redirectUrlGroup"
          v-model="profilesStore.selectedProfile.redirectUrlGroup"
        />
        <template v-if="profilesStore.selectedProfile.requestHeaderModGroups">
          <RequestModFieldWithActions
            v-for="{ id }, index in profilesStore.selectedProfile.requestHeaderModGroups"
            :key="id"
            v-model="profilesStore.selectedProfile.requestHeaderModGroups[index]!"
            action-type="request"
          />
        </template>
        <template v-if="profilesStore.selectedProfile.syncCookieGroups">
          <SyncCookieGroup
            v-for="{ id }, index in profilesStore.selectedProfile.syncCookieGroups"
            :key="id"
            v-model="profilesStore.selectedProfile.syncCookieGroups[index]!"
          />
        </template>
        <template v-if="profilesStore.selectedProfile.responseHeaderModGroups">
          <RequestModFieldWithActions
            v-for="{ id }, index in profilesStore.selectedProfile.responseHeaderModGroups"
            :key="id"
            v-model="profilesStore.selectedProfile.responseHeaderModGroups[index]!"
            action-type="response"
          />
        </template>
        <FiltersFieldset v-if="Object.keys(profilesStore.selectedProfile.filters).length" />
      </div>
    </div>
  </div>
</template>
