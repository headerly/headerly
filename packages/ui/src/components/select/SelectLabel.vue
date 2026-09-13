<script setup lang="ts">
import type { SelectLabelProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { cn } from "@headerly/ui/lib/utils";
import { SelectLabel } from "reka-ui";

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes["class"] }>();
</script>

<template>
  <SelectLabel
    data-slot="select-label"
    :class="cn('px-2 py-1.5 text-xs text-muted-foreground', props.class)"
  >
    <slot />
  </SelectLabel>
</template>
