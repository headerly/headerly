<script setup lang="ts" generic="T extends AcceptableValue">
import type { AcceptableValue, ComboboxRootEmits, ComboboxRootProps } from "reka-ui";
import { ComboboxRoot, useForwardPropsEmits } from "reka-ui";

const props = defineProps<ComboboxRootProps<T>>();
const emits = defineEmits<ComboboxRootEmits<T>>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <ComboboxRoot
    v-slot="slotProps"
    data-slot="combobox"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </ComboboxRoot>
</template>
