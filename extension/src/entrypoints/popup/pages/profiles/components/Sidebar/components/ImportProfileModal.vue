<script setup lang="ts">
import JsonEditor from "#/components/JsonEditor.vue";
import { Button } from "#/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/ui/dialog";
import { ref, useTemplateRef } from "vue";
import { toast } from "vue-sonner";
import { z } from "zod";
import { useJsonValidation } from "@/composables/useJsonValidation";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addProfileIds, profileWithoutIdsZodSchema } from "@/lib/schema";

const open = defineModel<boolean>("open", { required: true });

const userInput = ref("");

// Only accept array of profiles with at least one profile
const profilesWithoutIdArraySchema = z.array(profileWithoutIdsZodSchema).min(1);

const profilesStore = useProfilesStore();
const fileInputRef = useTemplateRef("fileInputRef");

const { validJson, validJsonSchema, formatJson } = useJsonValidation(userInput);

function handleFormatJson() {
  userInput.value = formatJson();
}

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
        <JsonEditor v-model="userInput" height="280px" />
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
          @click="handleFormatJson"
        >
          Beautify
        </Button>
        <Button variant="secondary" @click="handleFileImport">
          Load from File
        </Button>
        <Button
          :disabled="!validJsonSchema"
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
