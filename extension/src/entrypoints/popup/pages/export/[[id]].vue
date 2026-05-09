<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import InfoTooltip from "#/components/InfoTooltip.vue";
import { Button } from "#/ui/button";
import { Checkbox } from "#/ui/checkbox";
import { Label } from "#/ui/label";
import { ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { toast } from "vue-sonner";
import { useJsonValidation } from "@/composables/useJsonValidation";
import JsonEditor from "@/entrypoints/popup/components/JsonEditor.vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { createProfileExchange } from "@/lib/schema";
import { cn } from "@/lib/utils";
import ProfileCheckboxes from "./components/ProfileCheckboxes.vue";

const profilesStore = useProfilesStore();
const route = useRoute();

const selectedProfiles = ref<Profile[]>([]);

const exportCookieValue = ref(false);

const jsonPreview = ref("");

// Auto-select profile from route param
watch(() => [profilesStore.ready, route.params.id] as const, ([ready, id]) => {
  if (!ready)
    return;
  const profile = profilesStore.manager.profiles.find(p => p.id === id);
  if (profile) {
    selectedProfiles.value = [profile];
    handleSelectionChange([profile]);
  }
}, { immediate: true });

// Reset selected profiles to empty
onBeforeRouteLeave(() => {
  selectedProfiles.value = [];
  exportCookieValue.value = false;
  handleSelectionChange([]);
});

function handleSelectionChange(profiles: Profile[]) {
  selectedProfiles.value = profiles;
  updateJsonPreview();
}

function updateJsonPreview() {
  const profiles = selectedProfiles.value;
  if (profiles.length === 0) {
    jsonPreview.value = "";
    return;
  }
  const profileExchange = createProfileExchange(profiles);
  if (!exportCookieValue.value) {
    for (const profile of profileExchange.profiles) {
      for (const group of profile.syncCookieGroups ?? []) {
        for (const item of group.items) {
          item.value = "";
        }
      }
    }
  }
  jsonPreview.value = JSON.stringify(profileExchange, null, 2);
}

watch(exportCookieValue, () => {
  updateJsonPreview();
});

const { validJson, validJsonSchema, formatJson } = useJsonValidation(jsonPreview);

async function handleCopyJson() {
  await navigator.clipboard.writeText(jsonPreview.value);
  toast.success("Profile JSON copied to clipboard");
}

async function handleDownloadJson() {
  const blob = new Blob([jsonPreview.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "headerly-profiles.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div
    v-if="profilesStore.ready"
    :class="cn(
      `grid grid-cols-[3rem_minmax(0,1fr)] grid-rows-[3rem_minmax(0,1fr)]`,
      'size-full',
    )"
  >
    <aside
      class="
        col-start-1 row-span-2 flex h-full flex-col justify-between border-r
        py-2
      "
    >
      <Button as-child size="icon-sm" variant="secondary" class="mx-2">
        <RouterLink to="/profiles">
          <i class="i-lucide-arrow-left size-4" />
          <span class="sr-only">Back to profiles</span>
        </RouterLink>
      </Button>
      <div
        class="
          flex h-4 items-center self-stretch
          before:h-0.5 before:w-full before:grow before:bg-border
          before:content-['']
        "
      />
      <ProfileCheckboxes v-model="selectedProfiles" :scroll-target-id-on-mounted="route.params.id" @change="handleSelectionChange" />
    </aside>
    <header
      class="
        col-start-2 row-start-1 flex items-center justify-between border-b px-2
      "
    >
      <h1
        class="flex items-center gap-2 text-base font-semibold"
      >
        <i class="i-lucide-arrow-up-to-line size-5" />
        Export Profiles
      </h1>
      <div class="flex justify-end space-x-2">
        <Button
          size="sm"
          variant="secondary"
          :disabled="!validJson"
          @click="jsonPreview = formatJson()"
        >
          <i class="i-lucide-braces" />
          Beautify
        </Button>
        <Button
          size="sm"
          variant="secondary"
          :disabled="!validJsonSchema"
          @click="handleDownloadJson"
        >
          <i class="i-lucide-hard-drive-download" />
          Save as File
        </Button>
        <Button
          size="sm"
          :disabled="!validJsonSchema"
          @click="handleCopyJson"
        >
          <i class="i-lucide-copy" />
          Copy
        </Button>
      </div>
    </header>
    <main
      class="
        col-start-2 row-start-2 flex flex-col overflow-x-hidden overflow-y-auto
      "
    >
      <div class="flex flex-1 flex-col">
        <div
          class="sticky top-0 z-10 flex items-center gap-2 bg-background p-2"
        >
          <Label class="flex items-center gap-2 text-sm font-normal">
            <Checkbox v-model="exportCookieValue" />
            Export cookie value
          </Label>
          <InfoTooltip description="Do not share cookies casually. They may expose private information or login credentials." />
        </div>
        <div class="flex h-full flex-1 flex-col space-y-2">
          <JsonEditor
            v-model="jsonPreview"
            class="flex-1"
            height="100%"
          />
        </div>
        <p
          class="
            sticky bottom-0 flex items-center gap-2 bg-background p-2 text-sm
            text-warning
          "
        >
          <i class="i-lucide-alert-triangle size-4" />
          Exported profiles may include sensitive authentication tokens or cookies.
        </p>
      </div>
    </main>
  </div>
</template>
