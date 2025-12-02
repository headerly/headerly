<script setup lang="ts">
import type { SelectTriggerProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { SelectIcon, SelectTrigger, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<SelectTriggerProps & { class?: HTMLAttributes["class"]; size?: "sm" | "default" }>(),
  { size: "default" },
);

const delegatedProps = reactiveOmit(props, "class", "size");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwardedProps"
    :class="cn(
      `
        select flex w-fit cursor-pointer items-center justify-between gap-2
        bg-none px-3 whitespace-nowrap text-base-content
        transition-[color,box-shadow]
        disabled:cursor-not-allowed disabled:opacity-50
        data-placeholder:text-current/60 data-placeholder:italic
        [&_svg]:pointer-events-none [&_svg]:shrink-0
        [&_svg:not([class*=\'size-\'])]:size-4
      `,
      props.class,
    )"
  >
    <slot />
    <SelectIcon as-child>
      <i class="i-lucide-chevron-down size-4 shrink-0 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>
