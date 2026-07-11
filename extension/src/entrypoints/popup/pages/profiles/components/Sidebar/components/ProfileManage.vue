<script setup lang="ts">
import type { HeaderMod } from "@/lib/schema";
import { match } from "ts-pattern";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import { Checkbox } from "#/ui/checkbox";
import { Input } from "#/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/ui/sheet";
import { Toggle } from "#/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import ProfileListItem from "./ProfileListItem.vue";

const open = defineModel<boolean>("open", {
  default: false,
});
const profilesStore = useProfilesStore();
const { t } = useI18n();

const searchKeyword = ref("");
const batchManage = ref(false);
const selectedProfileIds = ref<string[]>([]);
const searchInputRef = useTemplateRef<{ focus: () => void }>("searchInputRef");

watch(open, async (isOpen) => {
  if (!isOpen) {
    return;
  }

  await nextTick();
  searchInputRef.value?.focus();
}, { flush: "post" });

function matchHeaderMod(mod: HeaderMod) {
  return mod.name?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    || (mod.operation !== "remove" && mod.value.toLowerCase().includes(searchKeyword.value.toLowerCase()));
}

const searchResults = computed(() => {
  if (!searchKeyword.value) {
    return profilesStore.manager.profiles;
  }
  return profilesStore.manager.profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    || profile.emoji.includes(searchKeyword.value)
    || profile.id.includes(searchKeyword.value)
    || profile.requestHeaderModGroups?.some(({ items: mods }) => mods.some(matchHeaderMod))
    || profile.responseHeaderModGroups?.some(({ items: mods }) => mods.some(matchHeaderMod)),
  );
});

const hasSelectedProfiles = computed(() => selectedProfileIds.value.length > 0);

const allVisibleSelected = computed(() => {
  const visibleProfileIds = searchResults.value.map(profile => profile.id);
  const selectedVisibleCount = visibleProfileIds.filter(id => selectedProfileIds.value.includes(id)).length;
  if (selectedVisibleCount === 0) {
    return false;
  }
  if (selectedVisibleCount === visibleProfileIds.length) {
    return true;
  }
  return "indeterminate";
});

const selectAllLabel = computed(() =>
  match(allVisibleSelected.value === false || allVisibleSelected.value === "indeterminate")
    .with(true, () => t("share.selectAll"))
    .with(false, () => t("share.unselectAll"))
    .exhaustive(),
);

function updateBatchManage(value: boolean) {
  batchManage.value = value;
  if (!value) {
    selectedProfileIds.value = [];
  }
}

function isSelected(profileId: string) {
  return selectedProfileIds.value.includes(profileId);
}

function toggleProfileSelection(profileId: string, selected: boolean) {
  selectedProfileIds.value = match([selected, isSelected(profileId)] as const)
    .with([true, false], () => [...selectedProfileIds.value, profileId])
    .with([false, true], () => selectedProfileIds.value.filter(id => id !== profileId))
    .otherwise(() => selectedProfileIds.value);
}

function toggleSelectAllVisible() {
  const visibleProfileIds = searchResults.value.map(profile => profile.id);
  if (allVisibleSelected.value === true) {
    selectedProfileIds.value = selectedProfileIds.value.filter(id => !visibleProfileIds.includes(id));
    return;
  }

  selectedProfileIds.value = Array.from(new Set([
    ...selectedProfileIds.value,
    ...visibleProfileIds,
  ]));
}

function deleteSelectedProfiles() {
  if (!hasSelectedProfiles.value) {
    return;
  }

  const selectedProfiles = profilesStore.manager.profiles
    .filter(profile => selectedProfileIds.value.includes(profile.id));

  if (selectedProfiles.length === profilesStore.manager.profiles.length) {
    const firstProfileId = profilesStore.manager.profiles[0]!.id;
    selectedProfileIds.value
      .filter(id => id !== firstProfileId)
      .forEach(id => profilesStore.deleteProfile(id));
    profilesStore.deleteProfile(firstProfileId);
    selectedProfileIds.value = [];
    return;
  }

  selectedProfiles.forEach(profile => profilesStore.deleteProfile(profile.id));
  selectedProfileIds.value = [];
}

function setSelectedProfilesEnabled(enabled: boolean) {
  profilesStore.manager.profiles
    .filter(profile => selectedProfileIds.value.includes(profile.id))
    .forEach(profile => profile.enabled = enabled);
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger v-if="$slots.default" as-child>
      <slot />
    </SheetTrigger>

    <SheetContent
      side="left" class="
        flex w-2/5 flex-col gap-0 text-base
        sm:max-w-xs
      "
    >
      <SheetHeader>
        <SheetTitle>{{ t("profile.search.title") }}</SheetTitle>
      </SheetHeader>
      <div class="flex flex-1 flex-col gap-1">
        <div class="mx-4 flex items-center justify-between gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Toggle
                  :model-value="batchManage"
                  type="button"
                  class="px-2"
                  @update:model-value="updateBatchManage"
                >
                  <i class="i-lucide-settings-2 size-4.5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {{ t("profile.search.batchManage") }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div class="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as="div">
                  <Button
                    variant="secondary"
                    size="icon"
                    class="text-destructive"
                    :disabled="!hasSelectedProfiles"
                    @click="deleteSelectedProfiles"
                  >
                    <span class="sr-only">{{ t("profile.search.deleteSelectedProfiles") }}</span>
                    <i class="i-lucide-trash size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {{ t("profile.search.deleteSelectedProfiles") }}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as="div">
                  <Button
                    variant="secondary"
                    size="icon"
                    :disabled="!hasSelectedProfiles"
                    @click="setSelectedProfilesEnabled(false)"
                  >
                    <span class="sr-only">{{ t("profile.search.pauseSelectedProfiles") }}</span>
                    <i class="i-lucide-pause size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {{ t("profile.search.pauseSelectedProfiles") }}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as="div">
                  <Button
                    variant="secondary"
                    size="icon"
                    :disabled="!hasSelectedProfiles"
                    @click="setSelectedProfilesEnabled(true)"
                  >
                    <span class="sr-only">{{ t("profile.search.resumeSelectedProfiles") }}</span>
                    <i class="i-lucide-play size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {{ t("profile.search.resumeSelectedProfiles") }}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div class="relative mx-4">
          <i
            class="
              absolute top-1/2 left-2.5 i-lucide-search size-4.5
              -translate-y-1/2 opacity-50
            "
          />
          <Input
            ref="searchInputRef"
            v-model.lazy.trim="searchKeyword"
            type="search"
            :placeholder="t('profile.search.placeholder')"
            class="pl-8"
            autofocus
          />
        </div>
        <div
          class="mx-3 flex flex-1 flex-col gap-1 overflow-y-auto px-1"
        >
          <Button
            v-if="batchManage"
            variant="ghost"
            class="w-full justify-start gap-1.5 px-1.5!"
            :disabled="searchResults.length === 0"
            @click="toggleSelectAllVisible"
          >
            <Checkbox
              :model-value="allVisibleSelected"
              class="pointer-events-none"
            />
            <i class="i-lucide-check-square size-4.5" />
            <span class="ml-0.5">{{ selectAllLabel }}</span>
          </Button>
          <div v-auto-animate class="flex flex-col gap-1">
            <div
              v-for="(profile, index) in searchResults"
              :key="profile.id"
              class="w-full"
            >
              <ProfileListItem
                :index
                :profile
                layout="row"
                :switchable="!batchManage"
                @click="toggleProfileSelection(profile.id, !isSelected(profile.id))"
                @select="open = false"
              >
                <template v-if="batchManage" #prefix>
                  <Checkbox
                    :model-value="isSelected(profile.id)"
                    class="pointer-events-none"
                  />
                </template>
              </ProfileListItem>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
