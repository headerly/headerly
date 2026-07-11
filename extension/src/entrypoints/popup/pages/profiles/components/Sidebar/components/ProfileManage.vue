<script setup lang="ts">
import type { HeaderMod } from "@/lib/schema";
import { match } from "ts-pattern";
import { computed, ref } from "vue";
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
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

const open = defineModel<boolean>("open", {
  default: false,
});
const profilesStore = useProfilesStore();
const { t } = useI18n();

const searchKeyword = ref("");
const batchManage = ref(false);
const selectedProfileIds = ref<string[]>([]);

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

const canDeleteSelectedProfiles = computed(() => {
  const selectedExistingProfileCount = profilesStore.manager.profiles
    .filter(profile => selectedProfileIds.value.includes(profile.id))
    .length;
  return selectedExistingProfileCount > 0 && selectedExistingProfileCount < profilesStore.manager.profiles.length;
});

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
  if (!canDeleteSelectedProfiles.value) {
    return;
  }
  selectedProfileIds.value.forEach(id => profilesStore.deleteProfile(id));
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
      <div class="flex flex-1 flex-col gap-2">
        <div class="mx-4 flex items-center justify-between gap-2">
          <Toggle
            :model-value="batchManage"
            type="button"
            size="sm"
            class="px-2"
            @update:model-value="updateBatchManage"
          >
            <i class="i-lucide-settings-2 size-4" />
            <span>{{ t("profile.search.batchManage") }}</span>
          </Toggle>
          <div v-if="batchManage" class="flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon-xs"
              class="text-destructive"
              :disabled="!canDeleteSelectedProfiles"
              @click="deleteSelectedProfiles"
            >
              <span class="sr-only">{{ t("profile.actions.delete") }}</span>
              <i class="i-lucide-trash size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon-xs"
              :disabled="!hasSelectedProfiles"
              @click="setSelectedProfilesEnabled(false)"
            >
              <span class="sr-only">{{ t("profile.actions.pause") }}</span>
              <i class="i-lucide-pause size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon-xs"
              :disabled="!hasSelectedProfiles"
              @click="setSelectedProfilesEnabled(true)"
            >
              <span class="sr-only">{{ t("profile.actions.resume") }}</span>
              <i class="i-lucide-play size-4" />
            </Button>
          </div>
        </div>
        <div class="relative mx-4">
          <i
            class="
              absolute top-1/2 left-2.5 i-lucide-search size-4 -translate-y-1/2
              opacity-50
            "
          />
          <Input
            v-model.lazy.trim="searchKeyword"
            type="search"
            :placeholder="t('profile.search.placeholder')"
            class="pl-8"
            autofocus
          />
        </div>
        <div
          v-auto-animate
          class="mx-3 flex flex-1 flex-col gap-1 overflow-y-auto px-1"
        >
          <Button
            v-if="batchManage"
            variant="ghost"
            class="w-full justify-start gap-2"
            :disabled="searchResults.length === 0"
            @click="toggleSelectAllVisible"
          >
            <Checkbox
              :model-value="allVisibleSelected"
              class="pointer-events-none"
            />
            <span>{{ selectAllLabel }}</span>
          </Button>
          <div
            v-for="profile in searchResults"
            :key="profile.id"
            class="w-full"
          >
            <Button
              v-if="batchManage"
              variant="ghost"
              class="w-full justify-start gap-2"
              @click="toggleProfileSelection(profile.id, !isSelected(profile.id))"
            >
              <Checkbox
                :model-value="isSelected(profile.id)"
                class="pointer-events-none"
              />
              <span class="text-lg leading-none">{{ profile.emoji }} </span>
              <span class="truncate">{{ profile.name }}</span>
            </Button>
            <Button
              v-else
              variant="ghost"
              class="w-full justify-start gap-2"
              @click="() => {
                profilesStore.manager.selectedProfileId = profile.id
                open = false
              }"
            >
              <span class="text-lg leading-none">{{ profile.emoji }} </span>
              <span class="truncate">{{ profile.name }}</span>
            </Button>
          </div>
          <div
            v-if="searchResults.length === 0"
            class="py-6 text-center text-sm text-muted-foreground"
          >
            {{ t("profile.search.noProfiles") }}
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
