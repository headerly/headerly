<script setup lang="ts">
import { useVirtualizer } from "@tanstack/vue-virtual";
import { computed, ref } from "vue";
import emojisData from "@/assets/emojis.json" with { type: "json" };
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const selectedEmoji = defineModel<string>({ required: true });
const parentRef = ref<HTMLElement | null>(null);

const emojisWithCategory = [
  { label: "Smileys & People", icon: "i-lucide-smile", emojis: emojisData.smileysPeople },
  { label: "Animals & Nature", icon: "i-lucide-bird", emojis: emojisData.animalsNature },
  { label: "Food & Drink", icon: "i-lucide-apple", emojis: emojisData.foodDrink },
  { label: "Travel & Places", icon: "i-lucide-map-pin", emojis: emojisData.travelPlaces },
  { label: "Activities", icon: "i-lucide-car-front", emojis: emojisData.activities },
  { label: "Objects", icon: "i-lucide-lightbulb", emojis: emojisData.objects },
  { label: "Symbols", icon: "i-lucide-heart", emojis: emojisData.symbols },
  { label: "Flags", icon: "i-lucide-flag", emojis: emojisData.flags },
] as const;

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
  <div class="dropdown dropdown-start">
    <div
      tabindex="0" role="button"
      class="
        btn btn-square items-center justify-center text-xl btn-ghost btn-sm
        btn-primary
      "
    >
      {{ selectedEmoji }}
    </div>
    <div
      tabindex="0"
      class="
        dropdown-content z-10 flex h-82 w-67 flex-col rounded-box bg-base-300
        pt-2 shadow-sm
      "
    >
      <div class="px-2">
        <nav class="sticky top-0 z-10 rounded-box glass">
          <ul class="flex flex-nowrap justify-between gap-1 p-1">
            <li v-for="item in emojisWithCategory" :key="item.label">
              <TooltipProvider :delay-duration="200">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      class="btn btn-square btn-ghost btn-xs"
                      @click="scrollToCategory(item.label)"
                    >
                      <i :class="cn(item.icon, 'size-4')" />
                    </button>
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
        class="flex-1 overflow-y-auto px-2 pb-2"
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
              <h2 class="px-1 pt-1 text-sm font-semibold">
                {{ virtualItems[virtualRow.index]?.categoryLabel }}
              </h2>
            </div>

            <div
              v-else-if="virtualItems[virtualRow.index]?.type === 'emoji'"
              class="grid grid-cols-7 place-items-center gap-1"
            >
              <button
                v-for="emoji in virtualItems[virtualRow.index]?.emojis"
                :key="emoji"
                class="
                  btn btn-square size-9 text-xl btn-ghost btn-sm
                  hover:bg-base-100
                "
                @click="selectedEmoji = emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
