<script setup lang="ts">
import type { ComboboxInputEmits, ComboboxInputProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { ComboboxInput, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<ComboboxInputProps & {
  class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<ComboboxInputEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ComboboxInput
    data-slot="command-input"
    :class="cn(
      `
        h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3
        py-1 text-base shadow-xs transition-[color,box-shadow] outline-none
        selection:bg-primary selection:text-primary-foreground
        placeholder:text-muted-foreground
        disabled:cursor-not-allowed disabled:opacity-50
        dark:bg-input/30
      `,
      `
        focus-visible:border-ring focus-visible:ring-[3px]
        focus-visible:ring-ring/50
      `,
      props.class,
    )"

    v-bind="{ ...$attrs, ...forwarded }"
  >
    <slot />
  </ComboboxInput>
</template>
