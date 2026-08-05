<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";
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
        <div class="flex w-full items-center gap-1">
          <span class="sr-only">{{ t("headerMod.recent.title") }}</span>
          <div v-auto-animate class="w-full gap-1 space-x-1">
            <span
              v-for="name in names"
              :key="name"
              class="group/recent relative shrink-0"
            >
              <Button
                type="button"
                size="sm"
                variant="secondary"
                class="
                  h-6 max-w-30 justify-start rounded-full py-0 pr-6 pl-3.5
                  text-sm font-normal text-muted-foreground shadow-none
                  hover:text-foreground
                  xl:max-w-40
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
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</template>
