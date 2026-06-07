<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <i
    role="status"
    :aria-label="$t('common.loading')"
    :class="cn('i-lucide-loader-2 size-4 animate-spin', props.class)"
  />
</template>
