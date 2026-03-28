<script setup lang="ts">
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { useDark } from "@vueuse/core";
import { jsonSchema } from "codemirror-json-schema";
import { computed } from "vue";
import CodeMirror from "vue-codemirror6";
import { z } from "zod";
import { profileWithoutIdsZodSchema } from "@/lib/schema";

const model = defineModel<string>({ required: true });

const { readonly = false, height = "100%", width = "100%" } = defineProps<{
  readonly?: boolean;
  height?: string;
  width?: string;
}>();

const lang = json();
const linter = jsonParseLinter();

// Only accept array of profiles with at least one profile
const profilesWithoutIdArraySchema = z.array(profileWithoutIdsZodSchema).min(1);
const profilesArrayJsonSchema = z.toJSONSchema(profilesWithoutIdArraySchema);

type JSONSchema7 = Parameters<typeof jsonSchema>[0];
const dark = useDark();
const extensions = computed(() => {
  return [
    jsonSchema(profilesArrayJsonSchema as JSONSchema7),
    indentationMarkers(),
    dark.value && oneDark,
  ].filter(Boolean);
});
</script>

<template>
  <CodeMirror
    v-model="model"
    class="overflow-auto text-base shadow-xs outline-none"
    :lang
    :dark
    :linter
    basic
    wrap
    :extensions
    :readonly
  />
</template>

<style>
@reference "tailwindcss";
.cm-editor {
  width: v-bind(width);
  height: v-bind(height);
}

.cm-scroller {
  @apply font-mono!;
}
</style>
