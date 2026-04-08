<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { Check, Minus } from "lucide-vue-next";
import { AnimatePresence, motion } from "motion-v";
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-slot="slotProps"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn(`
        peer size-4 shrink-0 rounded-sm border border-input shadow-xs
        transition-shadow outline-none
        focus-visible:border-ring focus-visible:ring-[3px]
        focus-visible:ring-ring/50
        disabled:cursor-not-allowed disabled:opacity-50
        aria-invalid:border-destructive aria-invalid:ring-destructive/20
        data-[state=checked]:border-primary data-[state=checked]:bg-primary
        data-[state=checked]:text-primary-foreground
        data-[state=indeterminate]:bg-primary
        data-[state=indeterminate]:text-primary-foreground
        dark:aria-invalid:ring-destructive/40
      `,
         props.class)"
  >
    <CheckboxIndicator
      force-mount
      data-slot="checkbox-indicator"
      class="grid place-content-center text-current"
    >
      <AnimatePresence :initial="false">
        <motion.span
          v-if="slotProps.modelValue === true || slotProps.modelValue === 'indeterminate'"
          key="indicator"
          class="grid place-content-center"
          :initial="{ scale: 0, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0, opacity: 0 }"
          :transition="{ duration: 0.15 }"
        >
          <slot v-bind="slotProps">
            <Check v-if="slotProps.modelValue === true" class="size-3.5" />
            <Minus
              v-else-if="slotProps.modelValue === 'indeterminate'" class="
                size-3.5
              "
            />
          </slot>
        </motion.span>
      </AnimatePresence>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
