<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { Profile, RedirectTransformSimpleField } from "@/lib/schema";

import { match } from "ts-pattern";
import { computed } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn } from "@/lib/utils";
import AlertGroup from "./components/AlertGroup.vue";
import FiltersFieldset from "./components/FiltersFieldset.vue";
import InteractiveGridPattern from "./components/InteractiveGridPattern.vue";
import ModGroup from "./components/ModGroup/index.vue";
import QueryAddOrReplaceParamsGroup from "./components/ModGroup/QueryAddOrReplaceParamsGroup.vue";
import QueryRemoveParamsGroup from "./components/ModGroup/QueryRemoveParamsGroup.vue";
import RadioGroupAction from "./components/ModGroup/RadioGroupAction.vue";
import SyncCookieGroup from "./components/SyncCookieGroup/index.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const hasAnyNonEmptyFilters = computed(() => {
  const filters = profilesStore.selectedProfile.filters;
  return (Object.keys(filters) as (keyof Profile["filters"])[]).some((key) => {
    return match(key)
      .with("urlFilter", "regexFilter", (k) => {
        return filters[k]?.some(f => Boolean(f.value) && f.enabled) ?? false;
      })
      .with(
        "requestMethods",
        "excludedRequestMethods",
        "resourceTypes",
        "excludedResourceTypes",
        (k) => {
          return filters[k]?.some(f => f.enabled && f.value.length > 0) ?? false;
        },
      )
      .with(
        "requestDomains",
        "excludedRequestDomains",
        "initiatorDomains",
        "excludedInitiatorDomains",
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

const REDIRECT_SIMPLE_GROUP_CONFIGS = [
  {
    key: "redirectUrlGroup",
    name: "Redirect URL",
    description: "The redirect URL. Redirects to JavaScript URLs are not allowed.",
    placeholder: "https://example.com/",
    inputType: "url",
    showUseCurrentTabButton: true,
  },
  {
    key: "redirectRegexSubstitution",
    name: "Redirect Regex Substitution",
    description: "Substitution pattern for rules which specify a `regexFilter`. The first match of `regexFilter` within the url will be replaced with this pattern. Within `regexSubstitution`, backslash-escaped digits (\\1 to \\9) can be used to insert the corresponding capture groups. \\0 refers to the entire matching text.",
    placeholder: "https://example.com/\\1",
    inputType: "text",
    showUseCurrentTabButton: false,
  },
] as const;

const REDIRECT_TRANSFORM_SIMPLE_GROUP_CONFIGS = [
  {
    key: "fragment",
    name: "Transform Fragment",
    description: "The new fragment for the request. Should be either empty, in which case the existing fragment is cleared; or should begin with '#'.",
    placeholder: "#section",
  },
  {
    key: "host",
    name: "Transform Host",
    description: "The new host for the request.",
    placeholder: "example.com",
  },
  {
    key: "password",
    name: "Transform Password",
    description: "The new password for the request.",
    placeholder: "password",
  },
  {
    key: "path",
    name: "Transform Path",
    description: "The new path for the request. If empty, the existing path is cleared.",
    placeholder: "/new-path",
  },
  {
    key: "port",
    name: "Transform Port",
    description: "The new port for the request. If empty, the existing port is cleared.",
    placeholder: "443",
  },
  {
    key: "query",
    name: "Transform Query",
    description: "The new query for the request. Should be either empty, in which case the existing query is cleared; or should begin with '?'.",
    placeholder: "?foo=bar",
  },
  {
    key: "scheme",
    name: "Transform Scheme",
    description: "The new scheme for the request. Allowed values are \"http\", \"https\", \"ftp\" and \"chrome-extension\".",
    placeholder: "https",
  },
  {
    key: "username",
    name: "Transform Username",
    description: "The new username for the request.",
    placeholder: "username",
  },
] as const satisfies {
  key: RedirectTransformSimpleField;
  name: string;
  description: string;
  placeholder: string;
}[];

function isRedirectTransformEmpty() {
  const transform = profilesStore.selectedProfile.redirectTransform;
  if (!transform) {
    return true;
  }

  const hasSimpleField = REDIRECT_TRANSFORM_SIMPLE_GROUP_CONFIGS.some((config) => {
    return Boolean(transform[config.key]?.length);
  });
  const hasQueryTransform = Boolean(
    transform.queryTransform?.addOrReplaceParams?.items.length
    || transform.queryTransform?.removeParams?.items.length,
  );

  return !hasSimpleField && !hasQueryTransform;
}

function cleanupRedirectTransform() {
  const transform = profilesStore.selectedProfile.redirectTransform;
  if (!transform) {
    return;
  }

  const queryTransform = transform.queryTransform;
  if (queryTransform
    && !queryTransform.addOrReplaceParams?.items.length
    && !queryTransform.removeParams?.items.length) {
    delete transform.queryTransform;
  }

  if (isRedirectTransformEmpty()) {
    delete profilesStore.selectedProfile.redirectTransform;
  }
}

function deleteSimpleRedirectGroup(key: "redirectUrlGroup" | "redirectRegexSubstitution") {
  delete profilesStore.selectedProfile[key];
}

function deleteRedirectTransformSimpleGroup(field: RedirectTransformSimpleField) {
  if (!profilesStore.selectedProfile.redirectTransform) {
    return;
  }
  delete profilesStore.selectedProfile.redirectTransform[field];
  cleanupRedirectTransform();
}

function deleteRedirectTransformQueryRemoveParamsGroup() {
  if (!profilesStore.selectedProfile.redirectTransform?.queryTransform) {
    return;
  }
  delete profilesStore.selectedProfile.redirectTransform.queryTransform.removeParams;
  cleanupRedirectTransform();
}

function deleteRedirectTransformQueryAddOrReplaceParamsGroup() {
  if (!profilesStore.selectedProfile.redirectTransform?.queryTransform) {
    return;
  }
  delete profilesStore.selectedProfile.redirectTransform.queryTransform.addOrReplaceParams;
  cleanupRedirectTransform();
}

const empty = computed(() => {
  const noRedirectTransform = isRedirectTransformEmpty();
  const noActions = (profilesStore.selectedProfile.requestHeaderModGroups ?? []).every(
    group => group.items.length === 0,
  )
  && (profilesStore.selectedProfile.responseHeaderModGroups ?? []).every(
    group => group.items.length === 0,
  )
  && (profilesStore.selectedProfile.syncCookieGroups ?? []).every(
    group => group.items.length === 0,
  )
  && (profilesStore.selectedProfile.redirectUrlGroup ?? []).length === 0
  && (profilesStore.selectedProfile.redirectRegexSubstitution ?? []).length === 0
  && noRedirectTransform;

  const noFilters = Object.keys(profilesStore.selectedProfile.filters).length === 0;
  return noActions && noFilters;
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
        No data, please add any actions or conditions first.
      </p>
      <InteractiveGridPattern
        class="
          inset-0 h-[200%] skew-y-12
          mask-[radial-gradient(350px_circle_at_center,white,transparent)]
        "
      />
    </div>
    <div v-else v-auto-animate class="mt-2 w-full px-2 pb-2">
      <AlertGroup :empty :has-any-filters="hasAnyNonEmptyFilters" />
      <template
        v-for="group in REDIRECT_SIMPLE_GROUP_CONFIGS"
        :key="group.key"
      >
        <RadioGroupAction
          v-if="profilesStore.selectedProfile[group.key]"
          v-model="profilesStore.selectedProfile[group.key]!"
          :name="group.name"
          :description="group.description"
          :placeholder="group.placeholder"
          :input-type="group.inputType"
          :show-use-current-tab-button="group.showUseCurrentTabButton"
          @delete-group="deleteSimpleRedirectGroup(group.key)"
        />
      </template>
      <template
        v-for="group in REDIRECT_TRANSFORM_SIMPLE_GROUP_CONFIGS"
        :key="group.key"
      >
        <RadioGroupAction
          v-if="profilesStore.selectedProfile.redirectTransform?.[group.key]"
          v-model="profilesStore.selectedProfile.redirectTransform![group.key]!"
          :name="group.name"
          :description="group.description"
          :placeholder="group.placeholder"
          @delete-group="deleteRedirectTransformSimpleGroup(group.key)"
        />
      </template>
      <QueryRemoveParamsGroup
        v-if="profilesStore.selectedProfile.redirectTransform?.queryTransform?.removeParams"
        v-model="profilesStore.selectedProfile.redirectTransform.queryTransform.removeParams"
        @delete-group="deleteRedirectTransformQueryRemoveParamsGroup"
      />
      <QueryAddOrReplaceParamsGroup
        v-if="profilesStore.selectedProfile.redirectTransform?.queryTransform?.addOrReplaceParams"
        v-model="profilesStore.selectedProfile.redirectTransform.queryTransform.addOrReplaceParams"
        @delete-group="deleteRedirectTransformQueryAddOrReplaceParamsGroup"
      />
      <template v-if="profilesStore.selectedProfile.requestHeaderModGroups">
        <ModGroup
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
        <ModGroup
          v-for="{ id }, index in profilesStore.selectedProfile.responseHeaderModGroups"
          :key="id"
          v-model="profilesStore.selectedProfile.responseHeaderModGroups[index]!"
          action-type="response"
        />
      </template>
      <FiltersFieldset v-if="Object.keys(profilesStore.selectedProfile.filters).length" />
    </div>
  </div>
</template>
