<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui";
import { cn } from "@/lib/utils";
import SheetOverlay from "./SheetOverlay.vue";

interface SheetContentProps extends DialogContentProps {
  class?: HTMLAttributes["class"];
  side?: "top" | "right" | "bottom" | "left";
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SheetContentProps>(), {
  side: "right",
});
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, "class", "side");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <SheetOverlay />
    <DialogContent
      data-slot="sheet-content"
      :class="cn(
        `
          fixed z-50 flex flex-col bg-base-100 shadow-lg transition ease-in-out
          data-[state=closed]:animate-out data-[state=closed]:duration-300
          data-[state=open]:animate-in data-[state=open]:duration-500
        `,
        side === 'right'
          && `
            inset-y-0 right-0 h-full w-3/4
            data-[state=closed]:slide-out-to-right
            data-[state=open]:slide-in-from-right
            sm:max-w-sm
          `,
        side === 'left'
          && `
            inset-y-0 left-0 h-full w-3/4
            data-[state=closed]:slide-out-to-left
            data-[state=open]:slide-in-from-left
            sm:max-w-sm
          `,
        side === 'top'
          && `
            inset-x-0 top-0 h-auto
            data-[state=closed]:slide-out-to-top
            data-[state=open]:slide-in-from-top
          `,
        side === 'bottom'
          && `
            inset-x-0 bottom-0 h-auto
            data-[state=closed]:slide-out-to-bottom
            data-[state=open]:slide-in-from-bottom
          `,
        props.class)"
      v-bind="{ ...forwarded, ...$attrs }"
    >
      <slot />

      <DialogClose
        class="
          absolute top-4 right-4 size-4 cursor-pointer rounded-xs opacity-70
          transition-opacity
          hover:opacity-100
          disabled:pointer-events-none
        "
      >
        <i class="i-lucide-x size-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
