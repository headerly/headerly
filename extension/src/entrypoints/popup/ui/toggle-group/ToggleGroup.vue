<script setup lang="ts">
import type { ToggleGroupRootEmits, ToggleGroupRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { ToggleVariants } from "#/ui/toggle";
import type { ToggleGroupVariants } from ".";
import { reactiveOmit } from "@vueuse/core";
import { ToggleGroupRoot, useForwardPropsEmits } from "reka-ui";
import { computed, provide } from "vue";
import { cn } from "@/lib/utils";
import { toggleGroupContext, toggleGroupVariants } from ".";

const props = withDefaults(defineProps<ToggleGroupRootProps & {
  class?: HTMLAttributes["class"];
  size?: ToggleVariants["size"];
  variant?: ToggleGroupVariants["variant"];
}>(), {
  size: "default",
  variant: "default",
});
const emits = defineEmits<ToggleGroupRootEmits>();

const delegatedProps = reactiveOmit(props, "class", "size", "variant");
const forwarded = useForwardPropsEmits(delegatedProps, emits);

provide(toggleGroupContext, {
  size: computed(() => props.size),
  variant: computed(() => props.variant),
});
</script>

<template>
  <ToggleGroupRoot
    v-slot="slotProps"
    data-slot="toggle-group"
    :data-variant="variant"
    v-bind="forwarded"
    :class="cn(toggleGroupVariants({ variant }), props.class)"
  >
    <slot v-bind="slotProps" />
  </ToggleGroupRoot>
</template>
