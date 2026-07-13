<script setup lang="ts">
import type { AddRuleOptionDialogItem, AddRuleOptionDialogTabValue } from "./shared";
import { useStorage } from "@vueuse/core";
import { ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import Badge from "#/ui/badge/Badge.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";

const props = defineProps<{
  tabValue: AddRuleOptionDialogTabValue;
  items: AddRuleOptionDialogItem[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { t } = useI18n();

const allOrders = useStorage<{
  [key in typeof props.tabValue]?: string[];
}>("headerly-add-rule-option-dialog-order", {});

const list = ref<AddRuleOptionDialogItem[]>([]);

function initList() {
  const savedOrder = allOrders.value[props.tabValue] ?? [];
  const itemsMap = new Map(props.items.map(item => [item.key, item]));
  const newList: AddRuleOptionDialogItem[] = [];

  for (const key of savedOrder) {
    if (itemsMap.has(key)) {
      newList.push(itemsMap.get(key)!);
      itemsMap.delete(key);
    }
  }

  for (const item of itemsMap.values()) {
    newList.push(item);
  }

  list.value = newList;
}

watch(
  () => props.items,
  initList,
  { immediate: true },
);

watch(
  () => list.value.map(item => item.key),
  (keys) => {
    allOrders.value = { ...allOrders.value, [props.tabValue]: keys };
  },
);

const listContainer = useTemplateRef<HTMLElement>("listContainer");

useSortableAndAutoAnimate({
  listContainer,
  list: list.value,
  handle: "[data-sort-handle]",
});
</script>

<template>
  <div
    ref="listContainer" class="
      mt-2 flex max-h-[60vh] flex-col gap-1 overflow-y-auto
    "
  >
    <div
      v-for="item in list"
      :key="item.key"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <div
              class="
                group flex w-full cursor-pointer items-center rounded-md border
                bg-background px-2 text-left text-sm transition-colors
                hover:bg-accent
                [[data-sorting]_&:not(.sortable-chosen)]:bg-background!
              "
              :class="{ 'opacity-50': item.disabled }"
            >
              <button
                class="flex flex-1 flex-col items-start p-3 pl-2"
                :disabled="item.disabled"
                :class="{ 'cursor-not-allowed!': item.disabled }"
                @click="() => {
                  item.action();
                  emit('close');
                }"
              >
                <div class="mb-1 flex items-center gap-2 font-semibold">
                  {{ item.title }}
                  <Badge v-if="item.isRecommended" class="gap-1">
                    <i class="i-lucide-star size-3" />
                    {{ t("common.recommended") }}
                  </Badge>
                </div>
                <div class="text-left text-xs text-muted-foreground">
                  {{ item.description }}
                </div>
              </button>
              <div
                data-sort-handle
                class="
                  flex cursor-grab items-center justify-center pl-2
                  text-muted-foreground opacity-0 transition-opacity
                  group-hover:opacity-100
                  group-[.sortable-chosen]:opacity-100
                  hover:text-foreground
                  [[data-sorting]_.group:not(.sortable-chosen)_&]:opacity-0!
                "
              >
                <i class="i-lucide-grip-vertical size-4" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            v-if="item.disabled && item.disabledTooltip"
            side="top"
            class="max-w-72"
          >
            {{ item.disabledTooltip }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
