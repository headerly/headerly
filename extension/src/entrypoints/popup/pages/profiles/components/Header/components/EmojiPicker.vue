<script setup lang="ts">
import { Button } from "#/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { computed, useTemplateRef } from "vue";
import { emojisWithCategory } from "@/entrypoints/popup/constants/emoji";
import { cn } from "@/lib/utils";

const selectedEmoji = defineModel<string>({ required: true });
const parentRef = useTemplateRef("parentRef");

interface VirtualItem {
  type: "header" | "emoji";
  categoryLabel?: string;
  emojis?: string[];
}

const virtualItems = computed<VirtualItem[]>(() => {
  const items: VirtualItem[] = [];

  emojisWithCategory.forEach((category) => {
    items.push({
      type: "header",
      categoryLabel: category.label,
    });

    const emojis = category.emojis;
    for (let i = 0; i < emojis.length; i += 7) {
      const rowEmojis = emojis.slice(i, i + 7);
      items.push({
        type: "emoji",
        emojis: rowEmojis,
      });
    }
  });

  return items;
});

const rowVirtualizer = useVirtualizer({
  count: virtualItems.value.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 36,
  overscan: 10,
});

function scrollToCategory(categoryLabel: string) {
  const targetIndex = virtualItems.value.findIndex(
    item => item.type === "header" && item.categoryLabel === categoryLabel,
  );

  if (targetIndex !== -1) {
    rowVirtualizer.value.scrollToIndex(targetIndex, {
      align: "start",
    });
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        size="icon"
        variant="ghost"
        class="items-center justify-center text-xl"
      >
        {{ selectedEmoji }}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" class="flex justify-center p-1">
      <div
        class="h-82 w-65"
      >
        <div class="relative flex size-full flex-col">
          <div class="sticky top-0 z-10 flex flex-col">
            <nav
              class="mt-2 rounded-md border bg-secondary"
            >
              <ul class="flex flex-nowrap justify-between p-0.5">
                <li v-for="item in emojisWithCategory" :key="item.label">
                  <TooltipProvider ignore-non-keyboard-focus>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          class="hover:bg-primary/10!"
                          size="icon-sm"
                          variant="ghost"
                          @click="scrollToCategory(item.label)"
                        >
                          <i :class="cn(item.icon, 'size-4')" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{{ item.label }}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              </ul>
            </nav>
          </div>
          <div
            ref="parentRef"
            class="flex-1 overflow-y-auto pb-2"
          >
            <div
              class="relative pb-2"
              :style="{
                height: `${rowVirtualizer.getTotalSize()}px`,
              }"
            >
              <div
                v-for="virtualRow in rowVirtualizer.getVirtualItems()"
                :key="virtualRow.index"
                class="absolute top-0 left-0 w-full"
                :style="{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }"
              >
                <div
                  v-if="virtualItems[virtualRow.index]?.type === 'header'"
                  class="flex h-full items-center"
                >
                  <h2 class="px-1 pt-1 text-sm font-medium">
                    {{ virtualItems[virtualRow.index]?.categoryLabel }}
                  </h2>
                </div>

                <div
                  v-else-if="virtualItems[virtualRow.index]?.type === 'emoji'"
                  class="grid grid-cols-7 place-items-center gap-1"
                >
                  <Button
                    v-for="emoji in virtualItems[virtualRow.index]?.emojis"
                    :key="emoji"
                    variant="ghost"
                    size="icon-sm"
                    class="
                      size-9 text-xl
                      hover:bg-accent
                    "

                    @click="selectedEmoji = emoji"
                  >
                    {{ emoji }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
