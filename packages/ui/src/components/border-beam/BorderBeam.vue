<script setup lang="ts">
import { cn } from "@headerly/ui/lib/utils";
import { computed } from "vue";

interface BorderBeamProps {
  class?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

const props = withDefaults(defineProps<BorderBeamProps>(), {
  size: 200,
  duration: 12,
  anchor: 90,
  borderWidth: 1.5,
  colorFrom: "var(--brand)",
  colorTo: "var(--ring)",
  delay: 0,
});

const durationInSeconds = computed(() => `${props.duration}s`);
const delayInSeconds = computed(() => `${props.delay}s`);
</script>

<template>
  <div aria-hidden="true" :class="cn('border-beam', props.class)" />
</template>

<style scoped>
.border-beam {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  border: calc(var(--border-width) * 1px) solid transparent;
  mask: linear-gradient(white, white) padding-box, linear-gradient(white, white) border-box;
  mask-composite: exclude;
  --size: v-bind(size);
  --duration: v-bind(durationInSeconds);
  --anchor: v-bind(anchor);
  --border-width: v-bind(borderWidth);
  --color-from: v-bind(colorFrom);
  --color-to: v-bind(colorTo);
  --delay: v-bind(delayInSeconds);
}

.border-beam::after {
  content: "";
  position: absolute;
  aspect-ratio: 1;
  width: calc(var(--size) * 1px);
  background: linear-gradient(to left, var(--color-from), var(--color-to), transparent);
  offset-anchor: calc(var(--anchor) * 1%) 50%;
  offset-path: rect(0 auto auto 0 round calc(var(--size) * 1px));
  animation: border-beam-anim var(--duration) infinite linear;
  animation-delay: var(--delay);
}

@keyframes border-beam-anim {
  to {
    offset-distance: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .border-beam::after {
    animation: none;
  }
}
</style>
