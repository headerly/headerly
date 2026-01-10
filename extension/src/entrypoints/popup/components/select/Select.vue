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
  size === "xs" && "select-xs",
  size === "sm" && "select-sm",
  size === "md" && "select-md",
  size === "lg" && "select-lg",

  type === "warning" && "text-warning select-warning",
  type === "error" && "text-error select-error",
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
      <div v-if="loading" class="skeleton h-4 w-20" />
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
