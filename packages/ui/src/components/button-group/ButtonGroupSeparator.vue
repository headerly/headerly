<script setup lang="ts">
import type { SeparatorProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { Separator } from "@headerly/ui/components/separator";
import { cn } from "@headerly/ui/lib/utils";
import { reactiveOmit } from "@vueuse/core";

const props = withDefaults(defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>(), {
  orientation: "vertical",
});
const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <Separator
    data-slot="button-group-separator"
    v-bind="delegatedProps"
    :orientation="props.orientation"
    :class="cn(
      `
        relative m-0! self-stretch bg-input
        data-[orientation=vertical]:h-auto
      `,
      props.class,
    )"
  />
</template>
