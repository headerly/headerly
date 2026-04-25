<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import { ref, useTemplateRef, watch } from "vue";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";

interface Item {
  key: string;
  title: string;
  description: string;
  action: () => void;
  disabled?: boolean;
}

const props = defineProps<{
  tabValue: string;
  items: Item[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const orderStorageKey = `headerly-add-mod-modal-${props.tabValue}-order`;
const savedOrder = useStorage<string[]>(orderStorageKey, []);

const list = ref<Item[]>([]);

function initList() {
  const itemsMap = new Map(props.items.map(item => [item.key, item]));
  const newList: Item[] = [];

  for (const key of savedOrder.value) {
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

initList();

watch(
  () => list.value.map(item => item.key),
  (keys) => {
    savedOrder.value = keys;
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
      class="
        group flex w-full items-center rounded-md border bg-background text-left
        text-sm transition-colors
        hover:bg-accent
      "
      :class="{ 'opacity-50': item.disabled }"
    >
      <div
        data-sort-handle
        class="
          flex cursor-grab items-center justify-center pl-2
          text-muted-foreground opacity-0 transition-opacity
          group-hover:opacity-100
          hover:text-foreground
        "
      >
        <i class="i-lucide-grip-vertical size-4" />
      </div>
      <button
        class="flex flex-1 flex-col items-start p-3 pl-2"
        :disabled="item.disabled"
        :class="{ 'cursor-not-allowed': item.disabled }"
        @click="() => {
          item.action();
          emit('close');
        }"
      >
        <div class="font-semibold">
          {{ item.title }}
        </div>
        <div class="text-left text-xs text-muted-foreground">
          {{ item.description }}
        </div>
      </button>
    </div>
  </div>
</template>
