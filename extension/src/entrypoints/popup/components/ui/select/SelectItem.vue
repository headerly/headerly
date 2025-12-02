<script setup lang="ts">
import type { SelectItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import {
  SelectItem,
  SelectItemIndicator,

  SelectItemText,
  useForwardProps,
} from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<SelectItemProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        `
          relative flex w-full cursor-pointer items-center gap-2 rounded-sm
          py-1.5 pr-8 pl-2 text-base outline-hidden transition select-none
          focus:bg-base-content/10 focus:text-base-content
          data-[disabled]:pointer-events-none data-[disabled]:opacity-50
          [&_svg]:pointer-events-none [&_svg]:shrink-0
          [&_svg:not([class*=\'size-\'])]:size-4
          [&_svg:not([class*=\'text-\'])]:bg-base-content/33
          *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2
        `,
        props.class,
      )
    "
  >
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectItemIndicator>
        <i class="i-lucide-check size-4" />
      </SelectItemIndicator>
    </span>

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
