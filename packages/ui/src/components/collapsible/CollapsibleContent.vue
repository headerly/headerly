<script setup lang="ts">
import type { CollapsibleContentProps } from "reka-ui";
import { cn } from "@headerly/ui/lib/utils";
import { CollapsibleContent } from "reka-ui";

interface Props extends CollapsibleContentProps {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <CollapsibleContent
    :class="
      cn(`
        overflow-hidden
        data-[state=closed]:animate-collapsible-up
        data-[state=open]:animate-collapsible-down
      `, props.class)
    "
    data-slot="collapsible-content"
    v-bind="props"
  >
    <slot />
  </CollapsibleContent>
</template>
