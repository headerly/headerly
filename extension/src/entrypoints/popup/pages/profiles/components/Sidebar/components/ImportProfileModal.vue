<script setup lang="ts">
import { Button } from "#/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/ui/dialog";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { useDark } from "@vueuse/core";
import { jsonSchema } from "codemirror-json-schema";
import { computed, ref, useTemplateRef } from "vue";
import CodeMirror from "vue-codemirror6";
import { toast } from "vue-sonner";
import { z } from "zod";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addProfileIds, profileWithoutIdsZodSchema } from "@/lib/schema";

const open = defineModel<boolean>("open", { required: true });

const userInput = ref("");
const lang = json();
const linter = jsonParseLinter();

const dark = useDark();

// Only accept array of profiles with at least one profile
const profilesWithoutIdArraySchema = z.array(profileWithoutIdsZodSchema).min(1);
const profilesArrayJsonSchema = z.toJSONSchema(profilesWithoutIdArraySchema);

type JSONSchema7 = Parameters<typeof jsonSchema>[0];
const extensions = computed(() => {
  return [
    jsonSchema(profilesArrayJsonSchema as JSONSchema7),
    indentationMarkers(),
    dark.value && oneDark,
  ].filter(Boolean);
});

const profilesStore = useProfilesStore();
const fileInputRef = useTemplateRef("fileInputRef");

function formatJson() {
  const parsed = JSON.parse(userInput.value);
  userInput.value = JSON.stringify(parsed, null, 2);
}

const validJson = computed(() => {
  try {
    const parsed = JSON.parse(userInput.value);
    const result = profilesWithoutIdArraySchema.safeParse(parsed);
    return result.success;
  } catch {
    return false;
  }
});

async function confirmImport() {
  try {
    const parsed = JSON.parse(userInput.value);
    const result = profilesWithoutIdArraySchema.safeParse(parsed);

    if (!result.success) {
      return;
    }

    for (const profileData of result.data) {
      const profileWithIds = addProfileIds(profileData);
      profilesStore.addProfile(profileWithIds);
    }

    toast.success(`Successfully imported ${result.data.length} profile${result.data.length === 1 ? "" : "s"}!`);
    open.value = false;
    userInput.value = "";
  } catch (error) {
    console.error("Import failed:", error);
    toast.error("Import failed: Invalid JSON format");
  }
}

function handleFileImport() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    userInput.value = content;
    toast.success("File loaded successfully");
  };

  reader.onerror = () => {
    toast.error("Failed to read file");
  };

  reader.readAsText(file);

  target.value = "";
}

function handleClose() {
  open.value = false;
  userInput.value = "";
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="
        flex flex-col
        sm:max-w-2xl
      "
    >
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          Import Profiles with JSON
        </DialogTitle>
      </DialogHeader>

      <div class="flex min-h-0 flex-1 flex-col gap-3">
        <div class="flex-1">
          <CodeMirror
            id="json-input"
            v-model="userInput"
            autofocus
            class="
              h-70 overflow-auto rounded-md text-base shadow-xs outline-none
            "
            :lang
            :dark
            :linter
            basic
            wrap
            :extensions
          />
        </div>
      </div>

      <DialogFooter class="flex flex-row justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary" @click="handleClose">
            Cancel
          </Button>
        </DialogClose>
        <Button
          variant="outline"
          :disabled="!validJson"
          @click="formatJson"
        >
          Beautify
        </Button>
        <Button variant="secondary" @click="handleFileImport">
          Load from File
        </Button>
        <Button
          :disabled="!validJson"
          @click="confirmImport"
        >
          Confirm Import
        </Button>

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileChange"
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style>
@reference "tailwindcss";
.cm-editor {
  @apply h-full
}
.cm-scroller {
    @apply font-mono!;
  }
</style>
