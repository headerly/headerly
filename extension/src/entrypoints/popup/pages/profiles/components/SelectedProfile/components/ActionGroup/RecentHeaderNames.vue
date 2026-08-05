<script setup lang="ts">
import type { AutoAnimationPlugin } from "@formkit/auto-animate";
import autoAnimate from "@formkit/auto-animate";
import { AnimatePresence, motion } from "motion-v";
import { onBeforeUnmount, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import { cn } from "@/lib/utils";

const props = defineProps<{
  names: string[];
  class?: string;
}>();

const emit = defineEmits<{
  (e: "add", name: string): void;
  (e: "remove", name: string): void;
}>();

const { t } = useI18n();

const tagAnimation: AutoAnimationPlugin = (element, action, newCoordinates, oldCoordinates) => {
  const timing = { duration: 160, easing: "ease-out" };

  if (action === "add") {
    return new KeyframeEffect(element, [
      { opacity: 0, transform: "translateX(-4px) scale(0.98)" },
      { opacity: 1, transform: "translateX(0) scale(1)" },
    ], timing);
  }

  if (action === "remove") {
    return new KeyframeEffect(element, [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(0.98)" },
    ], timing);
  }

  const previous = oldCoordinates!;
  const current = newCoordinates!;
  return new KeyframeEffect(element, [
    { transform: `translate(${previous.left - current.left}px, ${previous.top - current.top}px)` },
    { transform: "translate(0, 0)" },
  ], timing);
};

const tagsContainer = useTemplateRef<HTMLDivElement>("tagsContainer");
let tagsAnimationController: ReturnType<typeof autoAnimate> | undefined;

watch(tagsContainer, (element) => {
  tagsAnimationController?.destroy?.();
  tagsAnimationController = element ? autoAnimate(element, tagAnimation) : undefined;
}, { flush: "post" });

onBeforeUnmount(() => tagsAnimationController?.destroy?.());
</script>

<template>
  <AnimatePresence :initial="false">
    <motion.div
      v-if="names.length > 0"
      key="recent-header-names"
      class="w-full overflow-hidden"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: 'auto', opacity: 1 }"
      :exit="{ height: 0, opacity: 0 }"
      :transition="{
        height: { duration: 0.16, ease: 'easeOut' },
        opacity: { duration: 0.12, ease: 'easeOut' },
      }"
    >
      <div
        :class="cn(`flex min-h-6 items-center border-none`, props.class)"
      >
        <div class="flex items-center gap-1">
          <span class="sr-only">{{ t("headerMod.recent.title") }}</span>
          <div ref="tagsContainer" class="flex flex-wrap gap-1">
            <div
              v-for="name in names"
              :key="name"
              class="
                group/recent relative max-w-30 shrink-0
                xl:max-w-40
              "
            >
              <Button
                type="button"
                size="sm"
                variant="secondary"
                class="
                  h-6 w-full justify-start rounded-full py-0 pr-6 pl-3.5 text-sm
                  font-normal text-muted-foreground shadow-none
                  hover:text-foreground
                "
                :aria-label="t('headerMod.recent.add', { name })"
                @click="emit('add', name)"
              >
                <span class="truncate">{{ name }}</span>
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                class="
                  absolute top-1/2 right-1 size-4 -translate-y-1/2 rounded-full
                  text-muted-foreground/70
                  hover:bg-primary/15 hover:text-primary
                  focus-visible:bg-destructive/15 focus-visible:text-destructive
                  focus-visible:ring-1 focus-visible:ring-destructive/40
                "
                @click="emit('remove', name)"
              >
                <i class="i-lucide-x size-3" />
                <span class="sr-only">{{ t('headerMod.recent.remove', { name }) }}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</template>
