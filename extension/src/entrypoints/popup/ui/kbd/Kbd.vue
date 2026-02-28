<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <kbd
    :class="cn(
      `
        pointer-events-none inline-flex h-5 w-fit min-w-5 items-center
        justify-center gap-1 rounded-sm bg-muted px-1 font-mono text-xs
        font-medium text-muted-foreground select-none
      `,
      '[&_i:not([class*=\'size-\'])]:size-3',
      `
        in-data-[slot=tooltip-content]:bg-background/20
        in-data-[slot=tooltip-content]:text-background
        dark:in-data-[slot=tooltip-content]:bg-background/10
      `,
      props.class,
    )"
  >
    <slot />
  </kbd>
</template>
