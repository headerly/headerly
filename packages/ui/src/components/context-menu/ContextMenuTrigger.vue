<script setup lang="ts">
import type { ContextMenuTriggerProps } from "reka-ui";
import { ContextMenuTrigger, useForwardProps } from "reka-ui";

const props = defineProps<ContextMenuTriggerProps>();

const forwardedProps = useForwardProps(props);

function handleContextMenu(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault();
  }
}
</script>

<template>
  <ContextMenuTrigger
    data-slot="context-menu-trigger"
    v-bind="forwardedProps"
    @contextmenu="handleContextMenu"
  >
    <slot />
  </ContextMenuTrigger>
</template>
