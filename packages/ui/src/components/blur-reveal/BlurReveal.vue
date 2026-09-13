<script setup lang="ts">
import { useIntersectionObserver, usePreferredReducedMotion } from "@vueuse/core";
import { onBeforeUnmount, useTemplateRef, watch } from "vue";

interface Props {
  as?: string;
  duration?: number;
  delay?: number;
  blur?: string;
  yOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
  duration: 0.65,
  delay: 0,
  blur: "6px",
  yOffset: 12,
});

const container = useTemplateRef<HTMLElement>("container");
const reducedMotion = usePreferredReducedMotion();
let animation: Animation | undefined;
let revealed = false;

// Keep server-rendered content visible without JavaScript. Animate only on the
// first viewport entry, using the existing semantic element to preserve layout.
const { stop } = useIntersectionObserver(container, ([entry]) => {
  if (!entry?.isIntersecting || revealed || !container.value)
    return;

  revealed = true;
  stop();
  if (reducedMotion.value === "reduce")
    return;

  animation = container.value.animate([
    { opacity: 0, filter: `blur(${props.blur})`, transform: `translateY(${props.yOffset}px)` },
    { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
  ], {
    duration: props.duration * 1000,
    delay: props.delay * 1000,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: "backwards",
  });
}, { threshold: 0.15 });

watch(reducedMotion, (value) => {
  if (value === "reduce")
    animation?.cancel();
});
onBeforeUnmount(() => animation?.cancel());
</script>

<template>
  <component :is="props.as" ref="container">
    <slot />
  </component>
</template>
