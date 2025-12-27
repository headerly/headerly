<script setup lang="ts">
import type { TooltipContentEmits, TooltipContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { TooltipArrow, TooltipContent, TooltipPortal, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TooltipContentProps & { class?: HTMLAttributes["class"] }>(), {
  sideOffset: 4,
});

const emits = defineEmits<TooltipContentEmits>();

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      data-slot="tooltip-content"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(`
        animate-in rounded-field bg-base-300 text-base-content fade-in-0
        zoom-in-95
        data-[side=bottom]:slide-in-from-top-2
        data-[side=left]:slide-in-from-right-2
        data-[side=right]:slide-in-from-left-2
        data-[side=top]:slide-in-from-bottom-2
        data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
        z-50 w-fit px-3 py-1.5 font-sans text-sm font-medium text-balance
        data-[state=closed]:animate-out
      `, props.class)"
    >
      <slot />

      <TooltipArrow
        class="
          bg-base-300 fill-base-300 z-50 size-2.5 translate-y-[calc(-50%_-_2px)]
          rotate-45 rounded-[2px]
        "
      />
    </TooltipContent>
  </TooltipPortal>
</template>
