<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";

const comments = defineModel<string>();

const { t } = useI18n();
const commentsDialogRef = useTemplateRef("commentsDialogRef");
const hasComments = computed(() => Boolean(comments.value?.trim()));
const tooltipContent = computed(() => {
  if (hasComments.value) {
    return comments.value;
  }
  return t("common.noComments");
});
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          :aria-label="t('common.comments')"
          class="relative"
          size="icon-xs"
          type="button"
          variant="secondary"
          @click="commentsDialogRef?.open()"
        >
          <i class="i-lucide-message-square-more size-4" />
          <span
            v-if="hasComments"
            class="
              absolute top-0 right-0 z-10 inline-block aspect-square size-2
              translate-x-1/2 -translate-y-1/2 rounded-full bg-success
              bg-[radial-gradient(circle_at_35%_30%,oklch(1_0_0/calc(var(--depth)*.5)),#0000)]
              bg-center bg-no-repeat align-middle text-success
              shadow-[0_2px_3px_-1px_color-mix(in_oklab,currentColor_calc(var(--depth)*100%),#0000)]
              [--depth:1]
            "
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        :collision-padding="20"
        class="max-w-80 wrap-anywhere whitespace-pre-wrap"
        :class="{ italic: !hasComments }"
        side="top"
      >
        {{ tooltipContent }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <CommentsDialog
    ref="commentsDialogRef"
    v-model="comments"
  />
</template>
