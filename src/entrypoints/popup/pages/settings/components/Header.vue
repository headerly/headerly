<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { ref } from "vue";
import { cn } from "@/lib/utils";

const { class: className } = defineProps<{
  class?: string;
}>();

const settingsStore = useSettingsStore();
const resetToDefaultModal = ref<HTMLDialogElement | null>(null);
</script>

<template>
  <header
    :class="cn(
      'flex items-center justify-between bg-base-200 px-2',
      className,
    )"
  >
    <div class="flex items-center">
      <h1 class="flex items-center gap-2 font-sans font-semibold">
        <i class="i-lucide-settings size-5" />
        Settings
      </h1>
    </div>
    <div class="flex items-center gap-2">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              :disabled="!settingsStore.isModified"
              :class="cn(
                'btn btn-soft btn-sm',
                settingsStore.isModified && 'btn-error',
              )"
              @click="resetToDefaultModal?.showModal()"
            >
              <i class="i-lucide-refresh-cw size-4" />
              Reset
            </button>
          </TooltipTrigger>
          <TooltipContent v-if="settingsStore.isModified" side="bottom">
            Modified settings exist
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <dialog ref="resetToDefaultModal" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-semibold">
            Reset application settings
          </h3>
          <p class="py-4">
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </p>
          <div class="modal-action">
            <button
              class="btn btn-soft btn-error" @click="() => {
                settingsStore.resetToDefault();
                resetToDefaultModal?.close();
              }"
            >
              Confirm
            </button>
            <form method="dialog">
              <button class="btn btn-soft">
                Cancel
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  </header>
</template>
