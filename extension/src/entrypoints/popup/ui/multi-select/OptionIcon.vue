<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { motion } from "motion-v";
import { ref, watch } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  icon?: string;
  fallbackIcon?: string;
  class?: HTMLAttributes["class"];
}>();

const imageLoaded = ref(false);
const imageFailed = ref(false);

watch(
  () => props.icon,
  () => {
    imageLoaded.value = false;
    imageFailed.value = false;
  },
);

function handleLoad() {
  imageLoaded.value = true;
  imageFailed.value = false;
}

function handleError() {
  imageLoaded.value = false;
  imageFailed.value = true;
}
</script>

<template>
  <span :class="cn('relative block shrink-0 overflow-hidden rounded-sm', props.class)">
    <i
      v-if="fallbackIcon && (!icon || imageFailed)"
      aria-hidden="true"
      class="absolute inset-0 size-full"
      :class="fallbackIcon"
    />
    <motion.img
      v-if="icon"
      :key="icon"
      :src="icon"
      alt=""
      class="absolute inset-0 block size-full object-contain"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: imageLoaded ? 1 : 0 }"
      :transition="{ duration: 0.18, ease: 'easeOut' }"
      @load="handleLoad"
      @error="handleError"
    />
  </span>
</template>
