<script setup lang="ts">
import { Button } from "#/ui/button";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { useDark } from "@vueuse/core";
import { jsonSchema } from "codemirror-json-schema";
import { computed, ref } from "vue";
import CodeMirror from "vue-codemirror6";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addProfileIds, profileWithoutIdsJsonSchema, profileWithoutIdsZodSchema } from "@/lib/schema";

const userInput = ref("");
const lang = json();
const linter = jsonParseLinter();

const dark = useDark();

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

const profilesStore = useProfilesStore();
const router = useRouter();
async function confirmImport() {
  const parsed = JSON.parse(userInput.value);
  const result = profileWithoutIdsZodSchema.safeParse(parsed);
  if (!result.success) {
    return;
  }
  const profileWithIds = addProfileIds(result.data);
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
        <Button as-child variant="secondary" size="icon-sm">
          <RouterLink
            to="/profiles"
          >
            <i class="i-lucide-arrow-left size-4" />
            <span class="sr-only">Back to profiles</span>
          </RouterLink>
        </Button>
        <div class="ml-4 flex items-center">
          <h1 class="flex items-center gap-2 font-sans font-semibold">
            <i class="i-lucide-download size-5" />
            Import Profile
          </h1>
        </div>
      </div>
      <Button
        variant="default"
        size="sm"
        :disabled="!validJson"
        @click="confirmImport"
      >
        Confirm Import
      </Button>
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
