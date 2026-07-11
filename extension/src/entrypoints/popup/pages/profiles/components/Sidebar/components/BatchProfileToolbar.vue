<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import { Toggle } from "#/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";

const batchManage = defineModel<boolean>("batchManage", {
  required: true,
});

defineProps<{
  hasSelectedProfiles: boolean;
}>();

const emit = defineEmits<{
  deleteSelectedProfiles: [];
  pauseSelectedProfiles: [];
  resumeSelectedProfiles: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="mx-4 mb-1 flex items-center justify-between gap-2">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Toggle
            v-model="batchManage"
            type="button"
            class="px-2"
          >
            <span class="sr-only">{{ t("profile.search.batchManage") }}</span>
            <i class="i-lucide-settings-2 size-4.5" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ t("profile.search.batchManage") }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <div class="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as="div">
            <Button
              variant="secondary"
              size="icon"
              class="text-destructive"
              :disabled="!hasSelectedProfiles"
              @click="emit('deleteSelectedProfiles')"
            >
              <span class="sr-only">{{ t("profile.search.deleteSelectedProfiles") }}</span>
              <i class="i-lucide-trash size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ t("profile.search.deleteSelectedProfiles") }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as="div">
            <Button
              variant="secondary"
              size="icon"
              :disabled="!hasSelectedProfiles"
              @click="emit('pauseSelectedProfiles')"
            >
              <span class="sr-only">{{ t("profile.search.pauseSelectedProfiles") }}</span>
              <i class="i-lucide-pause size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ t("profile.search.pauseSelectedProfiles") }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as="div">
            <Button
              variant="secondary"
              size="icon"
              :disabled="!hasSelectedProfiles"
              @click="emit('resumeSelectedProfiles')"
            >
              <span class="sr-only">{{ t("profile.search.resumeSelectedProfiles") }}</span>
              <i class="i-lucide-play size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ t("profile.search.resumeSelectedProfiles") }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
