<script setup lang="ts">
import type { ProfileGroup } from "@headerly/schema";
import { AnimatePresence, motion } from "motion-v";

defineProps<{ group: ProfileGroup; open: boolean }>();
</script>

<template>
  <div class="relative flex gap-1.5">
    <motion.div
      class="shrink-0 origin-top rounded-full"
      :style="{ backgroundColor: group.color }"
      :initial="false"
      :animate="open
        ? { width: 3, opacity: 1, marginLeft: -9, scaleY: 1 }
        : { width: 0, opacity: 0, marginLeft: -6, scaleY: 0 }"
      :transition="{ duration: 0.18, ease: 'easeOut' }"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <slot name="header" />
      <AnimatePresence :initial="false">
        <motion.div
          v-if="open"
          key="profile-group-items"
          class="-mt-1 overflow-x-visible overflow-y-clip pt-1"
          :initial="{ height: 0, opacity: 0, y: -4 }"
          :animate="{ height: 'auto', opacity: 1, y: 0 }"
          :exit="{ height: 0, opacity: 0, y: -4 }"
          :transition="{ duration: 0.18, ease: 'easeOut' }"
        >
          <slot />
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
