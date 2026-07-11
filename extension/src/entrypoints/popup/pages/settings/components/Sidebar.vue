<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCreateSettings } from "../fields";

const { class: className } = defineProps<{
  class?: string;
}>();

const { t } = useI18n();
const settings = useCreateSettings();

function handleAnchorClick(anchor: string) {
  const element = document.getElementById(anchor);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<template>
  <aside
    :class="cn(
      `
        flex h-full flex-col items-center justify-start border-r
        border-r-(--pattern-fg)
        bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
        bg-size-[10px_10px] bg-fixed py-2 [--pattern-fg:var(--color-gray-950)]/5
        dark:[--pattern-fg:var(--color-white)]/10
      `,
      className,
    )"
  >
    <Button as-child size="icon-sm" variant="secondary">
      <RouterLink
        to="/profiles"
      >
        <i class="i-lucide-arrow-left size-4" />
        <span class="sr-only">{{ t("common.backToProfiles") }}</span>
      </RouterLink>
    </Button>
    <div
      class="
        flex h-4 items-center self-stretch
        before:h-px before:w-full before:grow before:bg-border
        before:content-['']
      "
    />
    <div class="flex flex-col gap-1 px-2 py-1.25">
      <TooltipProvider
        v-for="value in settings"
        :key="value.anchor"
      >
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon-sm"
              variant="secondary"
              @click.prevent="handleAnchorClick(value.anchor)"
            >
              <i :class="cn('size-4', value.anchorIcon)" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {{ value.fieldsetTitle }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </aside>
</template>
