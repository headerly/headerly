<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { cn } from "@/lib/utils";

const { description, class: className } = defineProps<{
  description: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <Tooltip>
      <TooltipTrigger as-child>
        <button :class="cn('flex items-center', className)">
          <i
            class="
              i-lucide-circle-question-mark size-4 cursor-pointer
              text-muted-foreground
            "
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" class="max-w-80">
        {{ description }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
