<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { ref } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../stores/useProfilesStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import AddModModal from "./AddModModal.vue";
import EmojiPicker from "./EmojiPicker.vue";

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
          btn-sm
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
        <i class="i-lucide-pencil-line size-4" />
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
    <div
      class="flex items-center justify-between gap-1 bg-base-200 p-1"
    >
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
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="btn btn-square btn-ghost btn-sm btn-primary"
              @click="profilesStore.duplicateProfile()"
            >
              <i class="i-lucide-copy size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Duplicate current profile
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AddModModal />
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="btn btn-square btn-ghost btn-sm btn-error"
              @click="profilesStore.deleteProfile"
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
          <TooltipContent side="bottom">
            {{ profilesStore.manager.profiles.length === 1 ? 'Reset current profile' : 'Delete current profile' }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </header>
</template>
