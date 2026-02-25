<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { LucideX } from "lucide-vue-next";
import {
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "reka-ui";
import { cn } from "@/lib/utils";

interface TagItem {
  label: string;
  value: string;
}

interface SelectableTagProps {
  item: TagItem;
  index?: number;
  variant?: "default" | "compact" | "more";
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<SelectableTagProps>(), {
  variant: "default",
});

const emit = defineEmits<{
  remove: [value: string];
  removeByIndex: [index: number];
}>();

function handleRemove() {
  if (props.variant === "default" && props.index !== undefined) {
    emit("removeByIndex", props.index);
  } else {
    emit("remove", props.item.value);
  }
}
</script>

<template>
  <TagsInputItem
    v-if="variant === 'default'"
    :value="item.label"
    :class="cn(`
      relative inline-flex h-7 shrink-0 cursor-default items-center rounded-md
      border bg-background ps-2 pe-7 pl-2 text-xs font-medium
      text-secondary-foreground transition-all
      hover:bg-background
      disabled:pointer-events-none disabled:cursor-not-allowed
      disabled:opacity-50
      data-fixed:pe-2
    `, props.class)"
  >
    <TagsInputItemText class="truncate" />
    <TagsInputItemDelete
      class="
        absolute -inset-y-px -end-px flex size-7 items-center justify-center
        rounded-e-md border border-transparent p-0 text-muted-foreground/80
        outline-hidden transition-[color,box-shadow] outline-none
        hover:text-foreground
        focus-visible:border-ring focus-visible:ring-[3px]
        focus-visible:ring-ring/50
      "
      @click="handleRemove"
    >
      <LucideX class="size-4" aria-hidden="true" />
    </TagsInputItemDelete>
  </TagsInputItem>

  <TagsInputItem
    v-else-if="variant === 'more'"
    :value="item.label"
    class="
      relative inline-flex h-7 shrink-0 cursor-pointer items-center rounded-md
      border bg-muted px-2 text-xs font-medium text-muted-foreground
      transition-all
      hover:bg-muted/80
    "
  >
    <TagsInputItemText />
  </TagsInputItem>

  <div
    v-else-if="variant === 'compact'"
    class="
      group inline-flex h-6 cursor-default items-center rounded-md border
      bg-background px-2 text-xs font-medium text-secondary-foreground
    "
  >
    <span>{{ item.label }}</span>
    <button
      class="
        ml-1 flex size-4 items-center justify-center text-muted-foreground/80
        transition-colors
        hover:text-foreground
      "
      @click="handleRemove"
    >
      <LucideX class="size-3" />
    </button>
  </div>
</template>
