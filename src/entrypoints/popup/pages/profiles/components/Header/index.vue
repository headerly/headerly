<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { useEventListener } from "@vueuse/core";
import { ref } from "vue";
import { cn, getModKey } from "@/lib/utils";
import AddModModal from "./components/AddModModal.vue";
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
</script>

<template>
  <header
    :class="cn(
      `flex items-center justify-between gap-1 bg-base-200 py-1 pr-1 pl-2`,
      settingsStore.powerOn || 'opacity-60',
      className,
    )"
  >
    <div
      class="flex items-center gap-1"
    >
      <EmojiPicker v-model="profilesStore.selectedProfile.emoji" />
      <button
        v-if="!profileNameEditing"
        class="
          btn flex items-center gap-1 px-1.5 text-base font-semibold btn-ghost
          btn-sm btn-primary
        "
        @click="() => {
          profileNameInput = profilesStore.selectedProfile.name
          profileNameEditing = true
        }"
      >
        <span
          class="max-w-50 overflow-hidden overflow-ellipsis whitespace-nowrap"
        >
          {{ profilesStore.selectedProfile.name }}</span>
      </button>
      <div v-else class="flex gap-1.5">
        <input
          v-model="profileNameInput"
          type="text"
          required
          class="
            input input-sm max-w-xs text-base
            user-invalid:input-error
          "
          @keyup.enter="handleEditProfileName"
          @keyup.esc="profileNameEditing = false"
        >
        <button
          class="
            btn flex btn-square items-center gap-2 text-base btn-soft btn-sm
          "
          @click="handleEditProfileName"
        >
          <i class="i-lucide-check-check size-4" />
        </button>
      </div>
    </div>
    <div class="flex items-center justify-between gap-1 p-1">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="btn btn-square btn-ghost btn-sm btn-primary"
              :disabled="!profilesStore.canUndo"
              @click="profilesStore.undo"
            >
              <i class="i-lucide-undo-2 size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Undo
            <span v-if="settingsStore.enableUndoAndRedoShortcut">
              <kbd class="mr-1 kbd font-mono kbd-sm">{{ getModKey() }}</kbd>
              <kbd class="kbd font-mono kbd-sm">Z</kbd>
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="btn btn-square btn-ghost btn-sm btn-primary"
              :disabled="!profilesStore.canRedo"
              @click="profilesStore.redo"
            >
              <i class="i-lucide-redo-2 size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Redo
            <span v-if="settingsStore.enableUndoAndRedoShortcut">
              <kbd class="mr-1 kbd font-mono kbd-sm">{{ getModKey() }}</kbd>
              <kbd class="mr-1 kbd font-mono kbd-sm">Shift</kbd>
              <kbd class="kbd font-mono kbd-sm">Z</kbd>
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <input
              v-model="profilesStore.selectedProfile.enabled"
              type="checkbox"
              :class="cn(
                `
                  btn btn-square btn-ghost btn-sm btn-primary
                  before:size-4
                  after:hidden
                `,
                profilesStore.selectedProfile.enabled
                  ? 'before:i-lucide-pause'
                  : `
                    btn-active
                    before:i-lucide-play
                  `,
              )"
            >
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ profilesStore.selectedProfile.enabled ? 'Pause current profile' : 'Resume current profile' }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AddModModal />
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="btn btn-square btn-ghost btn-sm btn-error"
              @click="profilesStore.deleteProfile(profilesStore.selectedProfile.id)"
            >
              <i
                :class="cn(
                  'size-4',
                  profilesStore.manager.profiles.length === 1
                    ? `i-lucide-refresh-ccw` : `i-lucide-trash`,
                )"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" :collision-padding="20">
            {{ profilesStore.manager.profiles.length === 1 ? 'Reset current profile' : 'Delete current profile' }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SecondaryOperations>
        <template #trigger="{ popovertarget }">
          <button
            :popovertarget
            :style="`anchor-name:--${popovertarget}`"
            class="btn btn-square btn-ghost btn-sm btn-primary"
          >
            <i class="i-lucide-ellipsis-vertical size-4" />
            <span class="sr-only">Open Secondary Operations Dropdown</span>
          </button>
        </template>
      </SecondaryOperations>
    </div>
  </header>
</template>
