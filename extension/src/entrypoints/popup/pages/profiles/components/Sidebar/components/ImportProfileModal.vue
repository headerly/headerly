<script setup lang="ts">
import { match } from "ts-pattern";
import { ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import JsonEditor from "#/components/JsonEditor/index.vue";
import { Button } from "#/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/ui/dialog";
import { useJsonValidation } from "@/composables/useJsonValidation";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addProfileIds, profileExchangeZodSchema } from "@/lib/schema";
import { ensureCookiesPermission } from "@/lib/utils";

const open = defineModel<boolean>("open", { required: true });

const userInput = ref("");

const profilesStore = useProfilesStore();
const fileInputRef = useTemplateRef("fileInputRef");
const { t } = useI18n();

const { validJson, validJsonSchema, formatJson } = useJsonValidation(userInput);

function handleFormatJson() {
  userInput.value = formatJson();
}

async function confirmImport() {
  try {
    const parsed = JSON.parse(userInput.value);
    const result = profileExchangeZodSchema.safeParse(parsed);

    if (!result.success) {
      return;
    }

    const { profiles } = result.data;
    const hasSyncCookieGroups = profiles.some(profile => Boolean(profile.syncCookieGroups?.length));
    if (hasSyncCookieGroups && !await ensureCookiesPermission()) {
      toast.error(t("import.toast.cookiesPermissionRequired"));
      return;
    }

    profilesStore.manager.profiles.push(...profiles.map(addProfileIds));

    const profileCountLabel = match(profiles.length === 1)
      .with(true, () => t("import.profile"))
      .with(false, () => t("import.profiles"))
      .exhaustive();
    toast.success(t("import.toast.success", { count: profiles.length, label: profileCountLabel }));
    open.value = false;
    userInput.value = "";
  } catch (error) {
    console.error("Import failed:", error);
    toast.error(t("import.toast.invalidJson"));
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
    toast.success(t("import.toast.fileLoaded"));
  };

  reader.onerror = () => {
    toast.error(t("import.toast.fileReadFailed"));
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
          {{ t("import.title") }}
        </DialogTitle>
      </DialogHeader>

      <div class="flex min-h-0 flex-1 flex-col gap-3">
        <JsonEditor v-model="userInput" height="280px" />
      </div>

      <DialogFooter class="flex flex-row justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary" @click="handleClose">
            {{ t("common.cancel") }}
          </Button>
        </DialogClose>
        <Button
          variant="secondary"
          :disabled="!validJson"
          @click="handleFormatJson"
        >
          {{ t("common.beautify") }}
        </Button>
        <Button variant="secondary" @click="handleFileImport">
          {{ t("import.loadFromFile") }}
        </Button>
        <Button
          :disabled="!validJsonSchema"
          @click="confirmImport"
        >
          {{ t("import.confirm") }}
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
