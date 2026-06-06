<script setup lang="ts">
import type { CollapsibleContentProps } from "reka-ui";
import { CollapsibleContent } from "reka-ui";

const props = defineProps<CollapsibleContentProps>();
</script>

<template>
  <CollapsibleContent
    class="
      overflow-hidden
      data-[state=closed]:animate-collapsible-up
      data-[state=open]:animate-collapsible-down
    "
    data-slot="collapsible-content"
    v-bind="props"
  >
    <slot />
  </CollapsibleContent>
</template>
