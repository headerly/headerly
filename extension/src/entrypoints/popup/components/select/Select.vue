<script setup lang="ts" generic="T extends {label: string, value: string, disabled?: boolean}">
import type { HTMLAttributes } from "vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/ui/select";
import { computed } from "vue";
import { cn } from "@/lib/utils";

interface Props {
  options: readonly T[];
  disabled?: boolean;
  placeholder?: string;
  type?: "normal" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
  class?: HTMLAttributes["class"];
  loading?: boolean;
}

const value = defineModel<T["value"]>({
  required: true,
});

const {
  options,
  disabled = false,
  type = "normal",
  size = "md",
  class: className,
  loading = false,
} = defineProps<Props>();

const emit = defineEmits<{
  (e: "change", value: T["value"]): void;
}>();

const triggerClasses = computed(() => cn(
  size === "xs" && "h-7 px-2 text-xs",
  size === "sm" && "h-8 px-3 text-sm",
  size === "md" && "h-10 px-3 text-sm",
  size === "lg" && "h-11 px-4 text-base",

  type === "warning" && "border-warning text-warning",
  type === "error" && "border-error text-error",
  className,
));
</script>

<template>
  <Select
    v-model="value"
    :disabled
    @update:model-value="(v) => {
      emit('change', v as T['value']);
    }"
  >
    <SelectTrigger :class="triggerClasses">
      <div v-if="loading" class="h-4 w-20 animate-pulse rounded bg-muted" />
      <SelectValue v-else :placeholder class="truncate" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        <slot name="label" :option>
          {{ option.label }}
        </slot>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
