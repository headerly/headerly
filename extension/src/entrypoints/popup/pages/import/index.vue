<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import JsonEditor from "#/components/JsonEditor/index.vue";
import { Button } from "#/ui/button";
import { useJsonValidation } from "@/composables/useJsonValidation";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { ensureCookiesPermission } from "@/lib/permissions";
import { decodeProfileSharePayload } from "@/lib/profileShare";
import { addProfileIds, profileExchangeZodSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

const profilesStore = useProfilesStore();
const route = useRoute();
const router = useRouter();
const fileInputRef = useTemplateRef("fileInputRef");
const { t } = useI18n();

const userInput = ref("");

const { validJson, validJsonSchema, formatJson } = useJsonValidation(userInput);

watch(() => route.query.profiles, async (profiles) => {
  if (typeof profiles === "string" && userInput.value === "") {
    try {
      userInput.value = await decodeProfileSharePayload(profiles);
      userInput.value = formatJson();
    } catch (error) {
      console.error("Failed to decode shared profiles:", error);
      toast.error(t("import.toast.invalidShareLink"), {
        description: t("import.toast.invalidShareLinkDescription"),
      });
    }
  }
}, { immediate: true });

function handleFormatJson() {
  userInput.value = formatJson();
}

async function closeImportPage() {
  userInput.value = "";
  await router.push("/");
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

    const profileCountLabel = profiles.length === 1 ? t("import.profile") : t("import.profiles");
    toast.success(t("import.toast.success", { count: profiles.length, label: profileCountLabel }));
    await router.push("/profiles");
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
</script>

<template>
  <div
    v-if="profilesStore.ready"
    :class="cn(
      'flex size-full items-center justify-center bg-background',
    )"
  >
    <div
      class="
        flex size-full flex-col overflow-y-auto rounded-lg border bg-background
        py-2 shadow-lg
      "
    >
      <header
        class="
          sticky top-0 z-10 flex items-center justify-between gap-4 border-b
          bg-background px-4 pb-2
        "
      >
        <h1 class="text-lg leading-none font-semibold">
          {{ t("import.title") }}
        </h1>
        <Button
          size="icon-sm"
          variant="ghost"
          class="
            -mr-2 opacity-70
            hover:opacity-100
          "
          @click="closeImportPage"
        >
          <i class="i-lucide-x size-4" />
          <span class="sr-only">{{ t("common.close") }}</span>
        </Button>
      </header>

      <main
        class="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <JsonEditor
          v-model="userInput"
          class="min-h-0 flex-1"
          height="100%"
        />
      </main>

      <footer
        class="
          sticky bottom-0 z-10 flex flex-row justify-end gap-2 border-t
          bg-background px-4 pt-2
        "
      >
        <Button variant="secondary" @click="closeImportPage">
          {{ t("common.cancel") }}
        </Button>
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

        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileChange"
        >
      </footer>
    </div>
  </div>
</template>
