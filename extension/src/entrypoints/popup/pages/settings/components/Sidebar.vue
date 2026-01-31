<script setup lang="ts">
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { cn } from "@/lib/utils";
import { settings } from "../fields";

const { class: className } = defineProps<{
  class?: string;
}>();

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
      `flex h-full flex-col items-center justify-start border-r py-2`,
      className,
    )"
  >
    <Button as-child size="icon-sm" variant="secondary">
      <RouterLink
        to="/profiles"
      >
        <i class="i-lucide-arrow-left size-4" />
        <span class="sr-only">Back to profiles</span>
      </RouterLink>
    </Button>
    <div
      class="
        flex h-4 items-center self-stretch
        before:h-0.5 before:w-full before:grow-1 before:bg-border
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
