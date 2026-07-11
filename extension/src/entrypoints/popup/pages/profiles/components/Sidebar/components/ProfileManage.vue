<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import Fuse from "fuse.js/basic";
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
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import BatchProfileToolbar from "./BatchProfileToolbar.vue";
import ProfileListItem from "./ProfileListItem.vue";
import { useBatchProfileManage } from "./useBatchProfileManage";

const open = defineModel<boolean>("open", {
  default: false,
});
const profilesStore = useProfilesStore();
const { t } = useI18n();

const searchKeyword = ref("");
const debouncedSearchKeyword = refDebounced(searchKeyword, 500);
const searchInputRef = useTemplateRef<{ focus: () => void }>("searchInputRef");

const profileSearchIndex = computed(() => new Fuse(
  profilesStore.manager.profiles.map(profile => ({
    profile,
    json: JSON.stringify(profile),
  })),
  {
    keys: ["json"],
    ignoreLocation: true,
  },
));

const searchResults = computed(() => {
  const keyword = debouncedSearchKeyword.value.trim();
  if (!keyword) {
    return profilesStore.manager.profiles;
  }
  return profileSearchIndex.value.search(keyword).map(result => result.item.profile);
});

const {
  allVisibleSelected,
  batchManage,
  hasSelectedProfiles,
  selectAllLabel,
  deleteSelectedProfiles,
  isSelected,
  resetBatchManage,
  setSelectedProfilesEnabled,
  toggleProfileSelection,
  toggleSelectAllVisible,
} = useBatchProfileManage(() => searchResults.value);

watch(open, async (isOpen) => {
  if (!isOpen) {
    searchKeyword.value = "";
    resetBatchManage();
    return;
  }

  await nextTick();
  searchInputRef.value?.focus();
}, { flush: "post" });
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger v-if="$slots.default" as-child>
      <slot />
    </SheetTrigger>

    <SheetContent
      side="left" class="
        flex w-2/5 flex-col gap-0 overflow-hidden text-base
        sm:max-w-xs
      "
    >
      <SheetHeader>
        <SheetTitle>{{ t("profile.search.title") }}</SheetTitle>
      </SheetHeader>
      <div class="flex min-h-0 flex-1 flex-col gap-1">
        <div
          class="
            sticky top-0 z-10 flex shrink-0 flex-col gap-1 bg-background pb-1
          "
        >
          <BatchProfileToolbar
            v-model:batch-manage="batchManage"
            :has-selected-profiles
            @delete-selected-profiles="deleteSelectedProfiles"
            @pause-selected-profiles="setSelectedProfilesEnabled(false)"
            @resume-selected-profiles="setSelectedProfilesEnabled(true)"
          />
          <div class="relative mx-4">
            <i
              class="
                absolute top-1/2 left-2.5 i-lucide-search size-4.5
                -translate-y-1/2 opacity-50
              "
            />
            <Input
              ref="searchInputRef"
              v-model.trim="searchKeyword"
              type="search"
              :placeholder="t('profile.search.placeholder')"
              class="pl-8"
              autofocus
            />
          </div>
        </div>
        <div
          class="
            mx-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1 pb-2
            [scrollbar-width:none]
          "
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
