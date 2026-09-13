<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@headerly/ui/lib/utils";
import { usePreferredReducedMotion } from "@vueuse/core";
import { onBeforeUnmount, useTemplateRef } from "vue";

interface RippleButtonProps {
  class?: HTMLAttributes["class"];
  is?: "button" | "a";
  rippleColor?: string;
  duration?: number;
}

const props = withDefaults(defineProps<RippleButtonProps>(), {
  is: "button",
  rippleColor: "var(--brand)",
  duration: 600,
});

const button = useTemplateRef<HTMLElement>("button");
const reducedMotion = usePreferredReducedMotion();
const animations = new Set<Animation>();

function createRipple(event: MouseEvent) {
  if (!button.value || reducedMotion.value === "reduce")
    return;

  const rect = button.value.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.detail === 0 ? rect.width / 2 : event.clientX - rect.left;
  const y = event.detail === 0 ? rect.height / 2 : event.clientY - rect.top;
  const ripple = document.createElement("span");
  ripple.className = "pointer-events-none absolute rounded-full";
  ripple.setAttribute("aria-hidden", "true");
  Object.assign(ripple.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    backgroundColor: props.rippleColor,
  });
  button.value.append(ripple);
  const animation = ripple.animate([
    { transform: "scale(0)", opacity: 0.3 },
    { transform: "scale(2)", opacity: 0 },
  ], { duration: props.duration, easing: "ease-out", fill: "forwards" });
  animations.add(animation);
  function cleanup() {
    ripple.remove();
    animations.delete(animation);
  }
  void animation.finished.then(cleanup, cleanup);
}

onBeforeUnmount(() => animations.forEach(animation => animation.cancel()));
</script>

<template>
  <component
    :is="props.is"
    ref="button"
    :type="props.is === 'button' ? 'button' : undefined"
    :class="cn(`
      relative inline-flex cursor-pointer items-center justify-center
      overflow-hidden rounded-lg border-2 border-border bg-background px-4 py-2
      text-center text-primary
      focus-visible:outline-2 focus-visible:outline-offset-2
      focus-visible:outline-ring
      disabled:pointer-events-none disabled:opacity-50
    `, props.class)"
    @click="createRipple"
  >
    <span class="relative z-10 inline-flex items-center justify-center gap-2">
      <slot />
    </span>
  </component>
</template>
