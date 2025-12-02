<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/entrypoints/popup/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { settings } from "../fields";

const { class: className } = defineProps<{
  class?: string;
}>();

function handleAnchorClick(event: Event, anchor: string) {
  event.preventDefault();
  const element = document.getElementById(anchor);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<template>
  <aside
    :class="cn(
      'flex h-full flex-col items-center justify-start bg-base-200 py-2',
      className,
    )"
  >
    <RouterLink
      to="/profiles" class="btn btn-square btn-soft btn-sm btn-primary"
    >
      <i class="i-lucide-arrow-left size-4" />
      <span class="sr-only">Back to profiles</span>
    </RouterLink>
    <div class="divider m-0" />
    <div class="flex flex-col gap-1 px-2 py-1.25">
      <TooltipProvider
        v-for="value in settings"
        :key="value.anchor"
        :delay-duration="200"
      >
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="
                btn btn-square btn-soft btn-sm
                hover:btn-primary
              "
              @click="(event) => handleAnchorClick(event, value.anchor)"
            >
              <i :class="cn('size-4', value.anchorIcon)" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {{ value.fieldsetTitle }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </aside>
</template>
