<script setup lang="tsx">
import type { HTMLAttributes } from "vue";
import { useEventBus, useEventListener } from "@vueuse/core";
import { match } from "ts-pattern";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "#/ui/dropdown-menu";
import {
  Input,
} from "#/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useCompactScreen } from "@/composables/useCompactScreen";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { Badge } from "@/entrypoints/popup/ui/badge";
import { cn, getRuleActionTypeIcon, getRuleActionTypeLabel } from "@/lib/utils";
import IconsGroupWithMore from "../ProfileActions/IconsGroupWithMore.vue";
import AddModModal from "./components/AddModModal/index.vue";
import { openAddModModalKey } from "./components/AddModModal/open";
import EmojiPicker from "./components/EmojiPicker.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();

const isCompact = useCompactScreen();
const addModBus = useEventBus(openAddModModalKey);

const profileNameEditing = ref(false);
const profileNameInput = ref<string>("");
function handleEditProfileName() {
  if (profileNameInput.value.length && profilesStore.selectedProfile) {
    profilesStore.selectedProfile.name = profileNameInput.value;
  }
  profileNameEditing.value = false;
}

const settingsStore = useSettingsStore();

useEventListener(window, "keydown", (event: KeyboardEvent) => {
  if (document.activeElement?.matches("input, textarea")) {
    return;
  }

  const metaKey = event.ctrlKey || event.metaKey;
  if (metaKey && !event.shiftKey && event.key.toLowerCase() === "z" && profilesStore.canUndo) {
    event.preventDefault();
    profilesStore.undo();
  } else if (metaKey && event.shiftKey && event.key.toLowerCase() === "z" && profilesStore.canRedo) {
    event.preventDefault();
    profilesStore.redo();
  }
});

const undoAndRedoButtonGroup = [
  {
    key: "undo",
    icon: "i-lucide-undo-2",
    tooltip: (
      <p>
        {t("common.undo")}
      </p>
    ),
    get disabled() {
      return !profilesStore.canUndo;
    },
    onClick: profilesStore.undo,
  },
  {
    key: "redo",
    icon: "i-lucide-redo-2",
    tooltip: (
      <p>
        {t("common.redo")}
      </p>
    ),
    get disabled() {
      return !profilesStore.canRedo;
    },
    onClick: profilesStore.redo,
  },
] as const;

const actionTypeBadge = computed(() => ({
  icon: getRuleActionTypeIcon(profilesStore.selectedProfile.ruleActionType),
  label: getRuleActionTypeLabel(profilesStore.selectedProfile.ruleActionType),
}));

const defaultTab = computed(() => {
  return match(profilesStore.selectedProfile.ruleActionType)
    .with("modifyHeaders", "redirect", () => "actions" as const)
    .otherwise(() => "conditions" as const);
});
</script>

<template>
  <header
    :class="cn(
      `flex items-center justify-between gap-1 border-b py-1 pr-1 pl-2`,
      settingsStore.powerOn || 'opacity-60',
      className,
    )"
  >
    <div
      class="flex items-center gap-1"
    >
      <EmojiPicker v-model="profilesStore.selectedProfile.emoji" />
      <Button
        v-if="!profileNameEditing"
        variant="ghost"
        class="flex items-center gap-1 px-1.5 text-base font-semibold"
        @click="() => {
          profileNameInput = profilesStore.selectedProfile.name
          profileNameEditing = true
        }"
      >
        <span
          class="max-w-43 min-w-5 truncate"
        >
          {{ profilesStore.selectedProfile.name }}</span>
      </Button>
      <div v-else class="flex gap-1.5">
        <Input
          v-model.trim="profileNameInput"
          :class="cn('max-w-45 text-base', profileNameInput.length === 0 && `
            border-destructive
          `)"
          required
          @keyup.enter="handleEditProfileName"
          @keyup.esc="profileNameEditing = false"
        />
        <Button
          variant="ghost"
          size="icon"
          class="flex items-center gap-2 text-base"
          @click="handleEditProfileName"
        >
          <i class="i-lucide-check-check size-4" />
        </Button>
      </div>
      <div v-if="!profileNameEditing" class="flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Badge variant="secondary">
                <i class="i-lucide-layers-2" />
                <span
                  class="
                    hidden
                    md:inline
                  "
                >{{ t("profile.header.priorityLabel") }}</span>
                <span
                  class="
                    max-w-4 truncate
                    md:max-w-none
                  "
                >{{ profilesStore.selectedProfile.priority ?? 1 }}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="md:hidden">
              {{ t("profile.header.priorityValue", { priority: profilesStore.selectedProfile.priority ?? 1 }) }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Badge>
                <i :class="actionTypeBadge.icon" />
                <span
                  class="
                    hidden
                    md:inline
                  "
                >{{ actionTypeBadge.label }}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="md:hidden">
              {{ t("profile.header.ruleActionType", { type: actionTypeBadge.label }) }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    <div class="flex items-center justify-between gap-1 p-1">
      <template v-if="!isCompact">
        <TooltipProvider v-for="btn in undoAndRedoButtonGroup" :key="btn.key">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="secondary"
                size="icon-sm"
                :disabled="btn.disabled"
                @click="btn.onClick"
              >
                <i :class="cn(btn.icon, 'size-4')" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <component :is="btn.tooltip" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </template>

      <IconsGroupWithMore :profile="profilesStore.selectedProfile">
        <template #after-main>
          <AddModModal :tooltip-text="t('profile.header.addActionOrConditionTooltip')" :default-tab />
        </template>
        <template #compact-extra>
          <DropdownMenuGroup>
            <DropdownMenuItem :disabled="!profilesStore.canUndo" @click="profilesStore.undo">
              <span>{{ t("common.undo") }}</span>
            </DropdownMenuItem>
            <DropdownMenuItem :disabled="!profilesStore.canRedo" @click="profilesStore.redo">
              <span>{{ t("common.redo") }}</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="addModBus.emit({ target: 'actions' })">
              <span>{{ t("profile.header.addActionOrCondition") }}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </template>
      </IconsGroupWithMore>
    </div>
  </header>
</template>
