<script setup lang="tsx">
import type { HTMLAttributes } from "vue";
import { Button } from "#/ui/button";
import {
  Input,
} from "#/ui/input";
import { Kbd } from "#/ui/kbd";
import { Toggle } from "#/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useEventListener } from "@vueuse/core";
import { ref } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn, getModKey } from "@/lib/utils";
import AddModModal from "./components/AddModModal/index.vue";
import EmojiPicker from "./components/EmojiPicker.vue";
import SecondaryOperations from "./components/SecondaryOperations.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();

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
  if (!settingsStore.enableUndoAndRedoShortcut) {
    return;
  }

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
        Undo
        <Kbd class="mr-1">{getModKey()}</Kbd>
        <Kbd>Z</Kbd>
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
        Redo
        <Kbd class="mr-1">{getModKey()}</Kbd>
        <Kbd class="mr-1">Shift</Kbd>
        <Kbd>Z</Kbd>
      </p>
    ),
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
        class="flex items-center gap-1 px-1.5 text-base"
        @click="() => {
          profileNameInput = profilesStore.selectedProfile.name
          profileNameEditing = true
        }"
      >
        <span
          class="max-w-50 overflow-hidden overflow-ellipsis whitespace-nowrap"
        >
          {{ profilesStore.selectedProfile.name }}</span>
      </Button>
      <div v-else class="flex gap-1.5">
        <Input
          v-model="profileNameInput"
          :class="cn('max-w-xs text-base', profileNameInput.length === 0 && `
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
    </div>
    <div class="flex items-center justify-between gap-1 p-1">
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon-sm"
              variant="secondary"
              :class="{
                'bg-primary! text-primary-foreground!': !profilesStore.selectedProfile.enabled,
              }"
              as-child
            >
              <Toggle
                v-model="profilesStore.selectedProfile.enabled"
                size="sm"
                class="data-state=off:text-destructive!"
              >
                <i
                  :class="cn('size-4', profilesStore.selectedProfile.enabled
                    ? 'i-lucide-pause'
                    : 'i-lucide-play')"
                />
              </Toggle>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ profilesStore.selectedProfile.enabled ? 'Pause current profile' : 'Resume current profile' }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon-sm"
              variant="secondary"
              class="text-destructive!"
              @click="profilesStore.deleteProfile(profilesStore.selectedProfile.id)"
            >
              <i
                :class="cn(
                  'size-4',
                  profilesStore.manager.profiles.length === 1
                    ? `i-lucide-refresh-ccw` : `i-lucide-trash`,
                )"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" :collision-padding="20">
            {{ profilesStore.manager.profiles.length === 1 ? 'Reset current profile' : 'Delete current profile' }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AddModModal tooltip-text="Add a new action or condition" default-tab="actions" />

      <SecondaryOperations />
    </div>
  </header>
</template>
