<script setup lang="ts">
import type { JsonValidationError } from "@/composables/useJsonValidation";
import { Button } from "@headerly/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@headerly/ui/components/tooltip";
import { useI18n } from "vue-i18n";

defineProps<{ errors: JsonValidationError[] }>();
const { t } = useI18n();
</script>

<template>
  <TooltipProvider :delay-duration="150">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          data-testid="json-validation-errors"
          type="button"
          size="icon-sm"
          variant="secondary"
          class="absolute right-3 bottom-3 z-10 text-destructive shadow-sm"
          :aria-label="t('jsonEditor.validation.showErrors', { count: errors.length })"
        >
          <i class="i-lucide-circle-alert size-5" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        data-testid="json-validation-errors-tooltip"
        side="top"
        align="end"
        :collision-padding="8"
        class="max-w-[calc(100vw-2rem)]"
      >
        <p class="mb-2 font-semibold">
          {{ t("jsonEditor.validation.cannotImport") }}
        </p>
        <ul
          class="
            max-h-64 w-96 max-w-full list-disc space-y-2 overflow-y-auto pr-2
            pl-4
          "
        >
          <li
            v-for="(error, index) in errors" :key="index" class="wrap-anywhere"
          >
            <code class="block text-xs">{{ error.path }}</code>
            <span>{{ error.message }}</span>
          </li>
        </ul>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
