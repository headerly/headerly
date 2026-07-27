<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useEventBus } from "@vueuse/core";
import { match } from "ts-pattern";
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "#/ui/dropdown-menu";
import {
  Input,
} from "#/ui/input";
import { Kbd, KbdGroup } from "#/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useCompactScreen } from "@/composables/useCompactScreen";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn } from "@/lib/utils";
import IconsGroupWithMore from "../ProfileActions/IconsGroupWithMore.vue";
import ProfileManage from "../Sidebar/components/ProfileManage.vue";
import AddRuleOptionDialog from "./components/AddRuleOptionDialog/index.vue";
import { openAddRuleOptionDialogKey } from "./components/AddRuleOptionDialog/open";
import EmojiPicker from "./components/EmojiPicker.vue";
import ProfileBadges from "./components/ProfileBadges.vue";
import { useHeaderShortcuts } from "./useHeaderShortcuts";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();

const isCompact = useCompactScreen();
const addRuleOptionDialogBus = useEventBus(openAddRuleOptionDialogKey);
const profileSearchOpen = ref(false);
const profileActionsRef = useTemplateRef("profileActionsRef");

const profileNameEditing = ref(false);
const profileNameInput = ref<string>("");
function handleEditProfileName() {
  if (profileNameInput.value.length && profilesStore.selectedProfile) {
    profilesStore.selectedProfile.name = profileNameInput.value;
  }
  profileNameEditing.value = false;
}

const settingsStore = useSettingsStore();

const defaultTab = computed(() => {
  return match(profilesStore.selectedProfile.ruleActionType)
    .with("modifyHeaders", "redirect", () => "actions" as const)
    .otherwise(() => "conditions" as const);
});

const {
  addRuleOptionShortcutKeys,
  profileSearchShortcutKeys,
  redoShortcutKeys,
  toggleProfileShortcutKeys,
  undoShortcutKeys,
} = useHeaderShortcuts({
  canRedo: () => profilesStore.canRedo,
  canUndo: () => profilesStore.canUndo,
  openAddRuleOptionDialog: () => addRuleOptionDialogBus.emit({ target: defaultTab.value }),
  openProfileSearch: () => profileSearchOpen.value = true,
  redo: profilesStore.redo,
  toggleProfile: () => profilesStore.toggleProfileEnabled(profilesStore.selectedProfile.id),
  undo: profilesStore.undo,
});

const undoAndRedoButtonGroup = [
  {
    key: "undo",
    icon: "i-lucide-undo-2",
    label: t("common.undo"),
    shortcutKeys: undoShortcutKeys,
    get disabled() {
      return !profilesStore.canUndo;
    },
    onClick: profilesStore.undo,
  },
  {
    key: "redo",
    icon: "i-lucide-redo-2",
    label: t("common.redo"),
    shortcutKeys: redoShortcutKeys,
    get disabled() {
      return !profilesStore.canRedo;
    },
    onClick: profilesStore.redo,
  },
] as const;
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
          class="
            max-w-32 min-w-5 truncate
            lg:max-w-45
            xl:max-w-60
            2xl:max-w-80
          "
        >
          {{ profilesStore.selectedProfile.name }}</span>
      </Button>
      <div v-else class="flex gap-1.5">
        <Input
          v-model.trim="profileNameInput"
          :class="cn(`
            max-w-45 px-1.5 text-base font-semibold
            xl:max-w-60
            2xl:max-w-80
          `, profileNameInput.length === 0 && `border-destructive`)"
          required
          @keyup.enter="handleEditProfileName"
          @keyup.esc="profileNameEditing = false"
        />
        <Button
          variant="secondary"
          size="icon"
          class="flex items-center gap-2 text-base"
          @click="handleEditProfileName"
        >
          <i class="i-lucide-check-check size-4" />
        </Button>
      </div>
      <ProfileBadges
        v-if="!profileNameEditing"
        :profile="profilesStore.selectedProfile"
        @open-change-rule-action-type="profileActionsRef?.openChangeRuleActionType()"
        @open-priority="profileActionsRef?.openPriority()"
      />
    </div>
    <div class="flex items-center justify-between gap-1 p-1">
      <Button
        type="search"
        variant="secondary"
        size="sm"
        class="h-6 gap-1 rounded-full px-2"
        :aria-label="t('common.search')"
        @click="profileSearchOpen = true"
      >
        <i class="-ml-0.5 i-lucide-search size-3.5 text-accent-foreground/80" />
        <div class="flex gap-0.5">
          <span
            v-for="(key, index) in profileSearchShortcutKeys"
            :key="index"
            class="text-xs text-muted-foreground"
          >
            {{ key }}
          </span>
        </div>
      </Button>

      <template v-if="!isCompact">
        <TooltipProvider v-for="btn in undoAndRedoButtonGroup" :key="btn.key">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="secondary"
                size="icon-sm"
                :disabled="btn.disabled"
                :aria-label="btn.label"
                @click="btn.onClick"
              >
                <i :class="cn(btn.icon, 'size-4')" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="flex items-center gap-2">
              <span>{{ btn.label }}</span>
              <KbdGroup class="z-50">
                <Kbd v-for="key in btn.shortcutKeys" :key>
                  {{ key }}
                </Kbd>
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </template>

      <IconsGroupWithMore
        ref="profileActionsRef"
        :profile="profilesStore.selectedProfile"
        :toggle-shortcut-keys="toggleProfileShortcutKeys"
      >
        <template #after-main>
          <AddRuleOptionDialog
            :default-tab
            :shortcut-keys="addRuleOptionShortcutKeys"
            :tooltip-text="t('profile.header.addActionOrConditionTooltip')"
          />
        </template>
        <template #compact-extra>
          <DropdownMenuGroup>
            <DropdownMenuItem
              v-for="btn in undoAndRedoButtonGroup"
              :key="btn.key"
              :disabled="btn.disabled"
              @click="btn.onClick"
            >
              <span>{{ btn.label }}</span>
              <KbdGroup class="z-50 ml-auto">
                <Kbd v-for="key in btn.shortcutKeys" :key>
                  {{ key }}
                </Kbd>
              </KbdGroup>
            </DropdownMenuItem>
            <DropdownMenuItem @click="addRuleOptionDialogBus.emit({ target: 'actions' })">
              <span>{{ t("profile.header.addActionOrCondition") }}</span>
              <KbdGroup class="z-50 ml-auto">
                <Kbd v-for="key in addRuleOptionShortcutKeys" :key>
                  {{ key }}
                </Kbd>
              </KbdGroup>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </template>
      </IconsGroupWithMore>
    </div>
    <ProfileManage v-model:open="profileSearchOpen" />
  </header>
</template>
