<script setup lang="ts" generic="T extends AcceptableValue">
import type { AcceptableValue, SelectRootEmits, SelectRootProps } from "reka-ui";
import { SelectRoot, useForwardPropsEmits } from "reka-ui";

const props = defineProps<SelectRootProps<T>>();
const emits = defineEmits<SelectRootEmits<T>>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <SelectRoot
    data-slot="select"
    v-bind="forwarded"
  >
    <slot />
  </SelectRoot>
</template>
