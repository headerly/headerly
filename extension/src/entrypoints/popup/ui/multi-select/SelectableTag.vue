<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "reka-ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { cn } from "@/lib/utils";
import OptionIcon from "./OptionIcon.vue";

interface TagItem {
  label: string;
  value: string;
  icon?: string;
  fallbackIcon?: string;
  tooltip?: string;
  tooltipClass?: string;
}

interface SelectableTagProps {
  item: TagItem;
  index?: number;
  variant?: "default" | "more";
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<SelectableTagProps>(), {
  variant: "default",
});

const emit = defineEmits<{
  remove: [value: string];
  removeByIndex: [index: number];
  hover: [value: string];
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
  <TooltipProvider v-if="variant === 'default'">
    <Tooltip>
      <TooltipTrigger as-child>
        <TagsInputItem
          :value="item.label"
          :class="cn(`
            relative inline-flex h-7 max-w-26 shrink-0 cursor-default
            items-center gap-1 rounded-md bg-secondary ps-2 pe-7 pl-2 text-xs
            font-medium text-secondary-foreground transition-all
            hover:bg-secondary/66
            disabled:pointer-events-none disabled:cursor-not-allowed
            disabled:opacity-50
            data-fixed:pe-2
          `, props.class)"
          @pointerenter="emit('hover', item.value)"
        >
          <OptionIcon
            v-if="item.icon || item.fallbackIcon"
            :icon="item.icon"
            :fallback-icon="item.fallbackIcon"
            class="size-4"
          />
          <TagsInputItemText class="truncate" />
          <TagsInputItemDelete
            class="
              absolute -inset-y-px -end-px flex size-7 items-center
              justify-center rounded-e-md border border-transparent p-0
              text-muted-foreground/80 outline-hidden
              transition-[color,box-shadow] outline-none
              hover:text-foreground
              focus-visible:border-ring focus-visible:ring-[3px]
              focus-visible:ring-ring/50
            "
            @click="handleRemove"
          >
            <i class="i-lucide-x size-4" aria-hidden="true" />
          </TagsInputItemDelete>
        </TagsInputItem>
      </TooltipTrigger>
      <TooltipContent side="top" :collision-padding="8" :class="item.tooltipClass">
        {{ item.tooltip || item.label }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>

  <TagsInputItem
    v-else-if="variant === 'more'"
    :value="item.label"
    class="
      relative inline-flex h-7 shrink-0 cursor-pointer items-center rounded-md
      bg-muted px-2 text-xs font-medium text-muted-foreground transition-all
      hover:bg-muted/80
    "
  >
    <TagsInputItemText />
  </TagsInputItem>
</template>
