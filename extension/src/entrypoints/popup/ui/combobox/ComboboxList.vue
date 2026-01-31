<script setup lang="ts">
import type { ComboboxContentEmits, ComboboxContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { ComboboxContent, ComboboxPortal, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ComboboxContentProps & { class?: HTMLAttributes["class"] }>(), {
  position: "popper",
  align: "center",
  sideOffset: 4,
  collisionPadding: 8,
});
const emits = defineEmits<ComboboxContentEmits>();

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ComboboxPortal>
    <ComboboxContent
      data-slot="combobox-list"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          `
            z-50 flex
            max-h-[min(320px,var(--reka-combobox-content-available-height,320px))]
            min-h-0 w-(--reka-combobox-trigger-width)
            origin-(--reka-combobox-content-transform-origin) flex-col
            overflow-hidden rounded-md border bg-popover text-popover-foreground
            shadow-md outline-none
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:animate-in data-[state=open]:fade-in-0
            data-[state=open]:zoom-in-95
          `,
          props.class,
        )
      "
    >
      <slot />
    </ComboboxContent>
  </ComboboxPortal>
</template>
