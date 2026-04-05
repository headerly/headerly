<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { useDark } from "@vueuse/core";
import { jsonSchema } from "codemirror-json-schema";
import { computed, onErrorCaptured } from "vue";
import CodeMirror from "vue-codemirror6";
import { z } from "zod";
import { profileWithoutIdsZodSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

const model = defineModel<string>({ required: true });

const { readonly = false, height = "100%", width = "100%", class: className } = defineProps<{
  readonly?: boolean;
  height?: string;
  width?: string;
  class?: HTMLAttributes["class"];
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

onErrorCaptured((error, instance, errorInfo) => {
  console.error("JsonEditor Error Captured:", {
    error,
    message: error.message,
    stack: error.stack,
    instance,
    errorInfo,
  });

  return false; // Don't Propagate the error
});
</script>

<template>
  <CodeMirror
    v-model="model"
    :class="cn('overflow-auto text-base shadow-xs outline-none', className)"
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
