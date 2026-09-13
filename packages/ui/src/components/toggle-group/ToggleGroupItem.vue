<script setup lang="ts">
import type { ToggleVariants } from "@headerly/ui/components/toggle";
import type { ToggleGroupItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { toggleVariants } from "@headerly/ui/components/toggle";
import { cn } from "@headerly/ui/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import { ToggleGroupItem, useForwardProps } from "reka-ui";
import { inject } from "vue";
import { toggleGroupContext } from ".";

const props = defineProps<ToggleGroupItemProps & {
  class?: HTMLAttributes["class"];
  size?: ToggleVariants["size"];
  variant?: ToggleVariants["variant"];
}>();

const delegatedProps = reactiveOmit(props, "class", "size", "variant");
const forwardedProps = useForwardProps(delegatedProps);
const context = inject(toggleGroupContext, null);
</script>

<template>
  <ToggleGroupItem
    v-slot="slotProps"
    data-slot="toggle-group-item"
    v-bind="forwardedProps"
    :class="cn(
      toggleVariants({
        size: context?.size.value ?? size,
        variant: context?.variant.value ?? variant,
      }),
      props.class,
    )"
  >
    <slot v-bind="slotProps" />
  </ToggleGroupItem>
</template>
