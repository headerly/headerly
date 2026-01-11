<script setup lang="ts">
import type { ProfileWithoutIds } from "./schema";
import type { Profile } from "@/lib/type";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { useDark } from "@vueuse/core";
import { jsonSchema } from "codemirror-json-schema";
import { computed, ref } from "vue";
import CodeMirror from "vue-codemirror6";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { profileWithoutIdsJsonSchema, profileWithoutIdsZodSchema } from "./schema";

const userInput = ref("");
const lang = json();
const linter = jsonParseLinter();

const dark = useDark({
  attribute: "data-theme",
});

const validJson = computed(() => {
  try {
    const parsed = JSON.parse(userInput.value);
    const result = profileWithoutIdsZodSchema.safeParse(parsed);

    return result.success;
  } catch {
    return false;
  }
});

type JSONSchema7 = Parameters<typeof jsonSchema>[0];
const extensions = computed(() => {
  return [
    jsonSchema(profileWithoutIdsJsonSchema as JSONSchema7),
    dark.value && oneDark,
  ].filter(Boolean);
});

function addIdsToProfile(profileData: ProfileWithoutIds) {
  return {
    ...profileData,
    id: crypto.randomUUID(),
    syncCookieGroups: [],
    requestHeaderModGroups: profileData.requestHeaderModGroups.map(group => ({
      ...group,
      id: crypto.randomUUID(),
      items: group.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    })),
    responseHeaderModGroups: profileData.responseHeaderModGroups.map(group => ({
      ...group,
      id: crypto.randomUUID(),
      items: group.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    })),
    filters: {
      ...profileData.filters,
      urlFilter: profileData.filters.urlFilter?.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      })),
      regexFilter: profileData.filters.regexFilter?.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      })),
      initiatorDomains: profileData.filters.initiatorDomains
        ? {
            ...profileData.filters.initiatorDomains,
            items: profileData.filters.initiatorDomains.items.map(item => ({
              ...item,
              id: crypto.randomUUID(),
            })),
          }
        : undefined,
      excludedInitiatorDomains: profileData.filters.excludedInitiatorDomains
        ? {
            ...profileData.filters.excludedInitiatorDomains,
            items: profileData.filters.excludedInitiatorDomains.items.map(item => ({
              ...item,
              id: crypto.randomUUID(),
            })),
          }
        : undefined,
      requestDomains: profileData.filters.requestDomains
        ? {
            ...profileData.filters.requestDomains,
            items: profileData.filters.requestDomains.items.map(item => ({
              ...item,
              id: crypto.randomUUID(),
            })),
          }
        : undefined,
      excludedRequestDomains: profileData.filters.excludedRequestDomains
        ? {
            ...profileData.filters.excludedRequestDomains,
            items: profileData.filters.excludedRequestDomains.items.map(item => ({
              ...item,
              id: crypto.randomUUID(),
            })),
          }
        : undefined,
    },
  } satisfies Profile;
}

const profilesStore = useProfilesStore();
const router = useRouter();
async function confirmImport() {
  const parsed = JSON.parse(userInput.value);
  const result = profileWithoutIdsZodSchema.safeParse(parsed);
  if (!result.success) {
    return;
  }
  const profileWithIds = addIdsToProfile(result.data);
  profilesStore.addProfile(profileWithIds);
  toast.success("Profile imported successfully!");
  await router.push("/profiles");
  userInput.value = "";
}
</script>

<template>
  <div class="flex size-full flex-col overflow-x-hidden overflow-y-auto">
    <div
      class="
        sticky top-0 z-10 flex items-center justify-between
        bg-primary-foreground p-2
      "
    >
      <div class="flex items-center">
        <RouterLink
          to="/profiles" class="btn btn-square btn-soft btn-sm btn-primary"
        >
          <i class="i-lucide-arrow-left size-4" />
          <span class="sr-only">Back to profiles</span>
        </RouterLink>
        <div class="ml-4 flex items-center">
          <h1 class="flex items-center gap-2 font-sans font-semibold">
            <i class="i-lucide-download size-5" />
            Import Profile
          </h1>
        </div>
      </div>
      <button
        class="btn btn-soft btn-sm btn-primary"
        :disabled="!validJson"
        @click="confirmImport"
      >
        Confirm Import
      </button>
    </div>

    <div class="flex flex-1 flex-col">
      <CodeMirror
        v-model="userInput"
        class="flex-1"
        :lang
        :dark
        :linter
        basic
        wrap
        :extensions
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-content) {
  font-family: 'JetBrains Mono Variable', monospace !important;
}

:deep(.cm-gutters) {
  font-family: 'JetBrains Mono Variable', monospace !important;
  height: 100%;
}
</style>
