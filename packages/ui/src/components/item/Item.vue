<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { ItemVariants } from ".";
import { cn } from "@headerly/ui/lib/utils";
import { Primitive } from "reka-ui";
import { itemVariants } from ".";

const props = withDefaults(defineProps<PrimitiveProps & {
  class?: HTMLAttributes["class"];
  variant?: ItemVariants["variant"];
  size?: ItemVariants["size"];
}>(), {
  as: "div",
});
</script>

<template>
  <Primitive
    data-slot="item"
    :as
    :as-child
    :class="cn(itemVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
