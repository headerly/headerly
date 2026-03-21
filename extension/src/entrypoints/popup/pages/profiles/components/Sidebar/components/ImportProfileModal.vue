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

const validJson = computed(() => {
  try {
    const parsed = JSON.parse(userInput.value);
    const result = profilesWithoutIdArraySchema.safeParse(parsed);
    return result.success;
  } catch {
    return false;
  }
});

const importInfo = computed(() => {
  try {
    const parsed = JSON.parse(userInput.value);
    const result = profilesWithoutIdArraySchema.safeParse(parsed);

    if (!result.success) {
      return null;
    }

    return {
      count: result.data.length,
    };
  } catch {
    return null;
  }
});

// Create JSON schema for CodeMirror validation
const profilesArrayJsonSchema = z.toJSONSchema(profilesWithoutIdArraySchema);

type JSONSchema7 = Parameters<typeof jsonSchema>[0];
const extensions = computed(() => {
  return [
    jsonSchema(profilesArrayJsonSchema as JSONSchema7),
    dark.value && oneDark,
  ].filter(Boolean);
});

const profilesStore = useProfilesStore();
const fileInputRef = useTemplateRef("fileInputRef");

function formatJson() {
  try {
    const parsed = JSON.parse(userInput.value);
    userInput.value = JSON.stringify(parsed, null, 2);
    toast.success("JSON formatted successfully");
  } catch {
    toast.error("Invalid JSON format");
  }
}

async function confirmImport() {
  try {
    const parsed = JSON.parse(userInput.value);
    const result = profilesWithoutIdArraySchema.safeParse(parsed);

    if (!result.success) {
      // Check if it's an empty array specifically
      if (Array.isArray(parsed) && parsed.length === 0) {
        toast.error("Import failed: Cannot import empty profile list");
      } else {
        toast.error("Import failed: Invalid profile data format");
      }
      return;
    }

    // Import all profiles
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

  if (!file.name.endsWith(".json")) {
    toast.error("Please select a JSON file");
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

  // Clear the input
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
        flex max-h-[80vh] flex-col
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
            class="
              h-50 overflow-auto rounded-md border border-input bg-transparent
              text-base shadow-xs transition-[color,box-shadow] outline-none
              focus-within:border-ring focus-within:ring-[3px]
              focus-within:ring-ring/50
              aria-invalid:border-destructive aria-invalid:ring-destructive/20
              md:text-sm
              dark:bg-input/30
              dark:aria-invalid:ring-destructive/40
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
          <template v-if="importInfo">
            Import {{ importInfo.count }} Profile{{ importInfo.count !== 1 ? 's' : '' }}
          </template>
          <template v-else>
            Import Profiles
          </template>
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
