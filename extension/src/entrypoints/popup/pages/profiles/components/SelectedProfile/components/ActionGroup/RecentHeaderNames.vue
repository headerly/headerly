<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";
import { ref, watch } from "vue";
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
const displayedNames = ref([...props.names]);

watch(
  () => props.names,
  (names) => {
    // Keep the final item mounted while the whole alert exits so the item and
    // alert exit animations do not run at the same time.
    if (names.length > 0)
      displayedNames.value = [...names];
  },
);
</script>

<template>
  <AnimatePresence :initial="false">
    <motion.div
      v-if="names.length > 0"
      key="recent-header-names"
      class="w-full overflow-hidden"
      :initial="{ height: 0, opacity: 0, y: -4 }"
      :animate="{ height: 'auto', opacity: 1, y: 0 }"
      :exit="{ height: 0, opacity: 0, y: -4 }"
      :transition="{ duration: 0.2, ease: 'easeOut' }"
    >
      <div
        :class="cn(`flex items-center border-none`, props.class)"
      >
        <div class="flex items-center gap-1">
          <span class="sr-only">{{ t("headerMod.recent.title") }}</span>
          <div class="flex flex-wrap gap-1">
            <AnimatePresence :initial="false" mode="popLayout">
              <motion.div
                v-for="name in displayedNames"
                :key="name"
                layout="position"
                class="
                  group/recent relative max-w-30 shrink-0
                  xl:max-w-40
                "
                :initial="{ opacity: 0, scale: 0.96, x: -2 }"
                :animate="{ opacity: 1, scale: 1, x: 0 }"
                :exit="{ opacity: 0, scale: 0.96, x: -4 }"
                :transition="{
                  duration: 0.16,
                  ease: 'easeOut',
                  layout: { duration: 0.18, ease: 'easeOut' },
                }"
              >
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  class="
                    h-6 w-full justify-start rounded-full py-0 pr-6 pl-3.5
                    text-sm font-normal text-muted-foreground shadow-none
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
                    absolute top-1/2 right-1 size-4 -translate-y-1/2
                    rounded-full text-muted-foreground/70
                    hover:bg-primary/15 hover:text-primary
                    focus-visible:bg-destructive/15
                    focus-visible:text-destructive focus-visible:ring-1
                    focus-visible:ring-destructive/40
                  "
                  @click="emit('remove', name)"
                >
                  <i class="i-lucide-x size-3" />
                  <span class="sr-only">{{ t('headerMod.recent.remove', { name }) }}</span>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</template>
