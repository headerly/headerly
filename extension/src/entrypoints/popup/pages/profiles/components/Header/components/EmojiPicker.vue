<script setup lang="ts">
import { useVirtualizer } from "@tanstack/vue-virtual";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
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
import { useEmojisWithCategory } from "@/entrypoints/popup/constants/emoji";
import { cn } from "@/lib/utils";

const selectedEmoji = defineModel<string>({ required: true });
const parentRef = useTemplateRef("parentRef");
const emojisWithCategory = useEmojisWithCategory();
const { t } = useI18n();

type EmojiCategoryValue = ReturnType<typeof useEmojisWithCategory>[number]["value"];

interface VirtualItem {
  type: "header" | "emoji";
  categoryValue?: EmojiCategoryValue;
  categoryLabel?: string;
  emojis?: string[];
}

const virtualItems = computed<VirtualItem[]>(() => {
  const items: VirtualItem[] = [];

  emojisWithCategory.forEach((category) => {
    items.push({
      type: "header",
      categoryValue: category.value,
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

function scrollToCategory(categoryValue: EmojiCategoryValue) {
  const targetIndex = virtualItems.value.findIndex(
    item => item.type === "header" && item.categoryValue === categoryValue,
  );

  if (targetIndex !== -1) {
    rowVirtualizer.value.scrollToIndex(targetIndex, {
      align: "start",
    });
  }
}
</script>

<template>
  <div class="relative">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          size="icon"
          variant="ghost"
          class="peer/emoji-trigger items-center justify-center text-xl"
        >
          <span v-if="selectedEmoji">{{ selectedEmoji }}</span>
          <i v-else class="i-lucide-circle-off size-5 text-muted-foreground" />
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
                  <li v-for="item in emojisWithCategory" :key="item.value">
                    <TooltipProvider ignore-non-keyboard-focus>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <Button
                            class="hover:bg-primary/10!"
                            size="icon-sm"
                            variant="ghost"
                            @click="scrollToCategory(item.value)"
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
              class="w-full flex-1 overflow-y-auto pb-2"
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
                    class="grid grid-cols-7 place-items-center"
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
    <Button
      v-if="selectedEmoji"
      size="icon-xs"
      variant="outline"
      class="
        pointer-events-none absolute -top-1 -right-1 z-10 size-4 rounded-full
        bg-background p-0 opacity-0 shadow-xs transition-opacity
        peer-hover/emoji-trigger:pointer-events-auto
        peer-hover/emoji-trigger:opacity-100
        hover:pointer-events-auto hover:opacity-100
        focus-visible:pointer-events-auto focus-visible:opacity-100
      "
      @click.stop="selectedEmoji = ''"
    >
      <i class="i-lucide-x size-2.5" />
      <span class="sr-only">{{ t("emoji.remove") }}</span>
    </Button>
  </div>
</template>
