<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { Button } from "@headerly/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@headerly/ui/components/dropdown-menu";
import { cn } from "@headerly/ui/lib/utils";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";
import { useJsonValidation } from "@/composables/useJsonValidation";
import JsonEditor from "@/entrypoints/popup/components/JsonEditor/index.vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { encodeProfileSharePayload } from "@/lib/profileShare";
import { createProfileExchange } from "@/lib/schema";
import ProfileCheckboxes from "./components/ProfileCheckboxes.vue";

const profilesStore = useProfilesStore();
const route = useRoute();
const { t } = useI18n();

const selectedProfiles = ref<Profile[]>([]);

const jsonPreview = ref("");

// Route entry points select either one profile or every member of a group.
watch(() => [profilesStore.ready, route.params.id, route.query.groupId] as const, ([ready, id, groupId]) => {
  if (!ready)
    return;
  selectedProfiles.value = profilesStore.manager.profiles.filter(profile =>
    typeof groupId === "string" ? profile.groupId === groupId : profile.id === id,
  );
}, { immediate: true });

watch(() => [selectedProfiles.value, profilesStore.manager.profiles, profilesStore.profileGroups], () => {
  const selectedIds = new Set(selectedProfiles.value.map(profile => profile.id));
  if (!profilesStore.manager.profiles.some(profile => selectedIds.has(profile.id))) {
    jsonPreview.value = "";
    return;
  }
  jsonPreview.value = JSON.stringify(createProfileExchange(
    profilesStore.manager.profiles,
    profilesStore.profileGroups,
    selectedIds,
  ), null, 2);
}, { deep: true, immediate: true });

const { validJson, validJsonSchema, formatJson } = useJsonValidation(jsonPreview);

async function handleCopyJson() {
  await navigator.clipboard.writeText(jsonPreview.value);
  toast.success(t("share.toast.jsonCopied"));
}

async function handleCopyShareLink() {
  const payload = await encodeProfileSharePayload(jsonPreview.value);
  await navigator.clipboard.writeText(`https://headerly.dev/share?profiles=${payload}`);
  toast.success(t("share.toast.linkCopied"));
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
        border-r-(--pattern-fg)
        bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
        bg-size-[10px_10px] bg-fixed py-2 [--pattern-fg:var(--color-gray-950)]/5
        dark:[--pattern-fg:var(--color-white)]/10
      "
    >
      <Button as-child size="icon-sm" variant="secondary" class="mx-2">
        <RouterLink to="/profiles">
          <i class="i-lucide-arrow-left size-4" />
          <span class="sr-only">{{ t("common.backToProfiles") }}</span>
        </RouterLink>
      </Button>
      <div
        class="
          flex h-4 items-center self-stretch
          before:h-px before:w-full before:grow before:bg-border
          before:content-['']
        "
      />
      <ProfileCheckboxes v-model="selectedProfiles" :scroll-target-id-on-mounted="selectedProfiles[0]?.id" />
    </aside>
    <header
      class="
        col-start-2 row-start-1 flex items-center justify-between border-b px-2
      "
    >
      <h1
        class="flex items-center gap-2 text-base font-semibold"
      >
        {{ t("share.title") }}
      </h1>
      <div class="flex justify-end space-x-2">
        <Button
          size="sm"
          variant="secondary"
          :disabled="!validJson"
          @click="jsonPreview = formatJson()"
        >
          <i class="i-lucide-braces" />
          {{ t("common.beautify") }}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              data-testid="export-menu-trigger"
              size="sm"
              :disabled="!validJsonSchema"
            >
              <i class="i-lucide-share-2" />
              {{ t("common.share") }}
              <i class="i-lucide-chevron-down" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" :collision-padding="8" class="z-500">
            <DropdownMenuItem data-testid="export-copy-link" @click="handleCopyShareLink">
              <i class="i-lucide-link" />
              {{ t("share.copyLink") }}
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="export-copy-json" @click="handleCopyJson">
              <i class="i-lucide-copy" />
              {{ t("share.copyToClipboard") }}
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="export-download-json" @click="handleDownloadJson">
              <i class="i-lucide-hard-drive-download" />
              {{ t("share.saveAsFile") }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    <main
      class="
        col-start-2 row-start-2 flex flex-col overflow-x-hidden overflow-y-auto
      "
    >
      <div class="flex flex-1 flex-col">
        <div class="flex h-full flex-1 flex-col space-y-2">
          <JsonEditor
            v-model="jsonPreview"
            class="flex-1"
            height="100%"
            search-panel-sticky-top="2.25rem"
          />
        </div>
      </div>
    </main>
  </div>
</template>
