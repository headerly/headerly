<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useUiLabels } from "@headerly/ui/lib/labels";
import { cn } from "@headerly/ui/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
const labels = useUiLabels();
</script>

<template>
  <i
    role="status"
    :aria-label="labels.loading"
    :class="cn('i-lucide-loader-2 size-4 animate-spin', props.class)"
  />
</template>
