<script setup lang="ts">
import { useI18n } from "vue-i18n";
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
const { t } = useI18n();
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
        {{ t("common.settings") }}
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
                  {{ t("common.reset") }}
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" :collision-padding="5">
              {{ t("settings.reset.tooltip") }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{{ t("settings.reset.title") }}</AlertDialogTitle>
            <AlertDialogDescription>
              <p>{{ t("settings.reset.description") }}</p>
              <p>{{ t("settings.reset.cannotUndo") }}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{{ t("common.cancel") }}</AlertDialogCancel>
            <AlertDialogAction
              class="bg-destructive"
              @click="settingsStore.resetToDefault()"
            >
              {{ t("common.confirm") }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </header>
</template>
