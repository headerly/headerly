<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/ui/alert-dialog";
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn } from "@/lib/utils";

const { class: className } = defineProps<{
  class?: string;
}>();

const settingsStore = useSettingsStore();
</script>

<template>
  <header
    :class="cn(
      'flex items-center justify-between bg-secondary/33 px-2',
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
      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <AlertDialogTrigger as-child>
                <Button
                  variant="secondary"
                  :disabled="!settingsStore.isModified"
                >
                  <i class="i-lucide-refresh-cw size-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" :collision-padding="5">
              Reset extension settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset extension settings</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Are you sure you want to reset all settings to their default values?</p>
              <p>This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              class="bg-destructive"
              @click="settingsStore.resetToDefault()"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </header>
</template>
