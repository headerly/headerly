<script setup lang="ts">
import type { Transition } from "motion-v";
import type { HTMLAttributes } from "vue";
import { cn } from "@headerly/ui/lib/utils";
import { usePreferredReducedMotion } from "@vueuse/core";
import { stagger, useAnimate } from "motion-v";
import { computed, onBeforeUnmount, ref, watch } from "vue";

type RotateDirection = "top" | "right" | "bottom" | "left";
type StaggerOrigin = "first" | "last" | "center" | number;

interface Props {
  label: string;
  as?: string;
  class?: HTMLAttributes["class"];
  frontFaceClass?: HTMLAttributes["class"];
  secondFaceClass?: HTMLAttributes["class"];
  staggerDuration?: number;
  staggerFrom?: StaggerOrigin;
  transition?: Transition;
  rotateDirection?: RotateDirection;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  as: "span",
  staggerDuration: 0.03,
  staggerFrom: "first",
  transition: () => ({ type: "spring", damping: 30, stiffness: 300 }),
  rotateDirection: "right",
});

const [scope, animate] = useAnimate();
const isHovering = ref(false);
const isFocused = ref(false);
const reducedMotion = usePreferredReducedMotion();
let animation: { stop: () => void } | undefined;

function splitIntoCharacters(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return [...text];
}

const words = computed(() => props.label.split(" ").map((word, index, values) => ({
  characters: splitIntoCharacters(word),
  needsSpace: index !== values.length - 1,
})));

const rotationTransform = computed(() => ({
  top: "rotateX(90deg)",
  right: "rotateY(90deg)",
  bottom: "rotateX(-90deg)",
  left: "rotateY(90deg)",
})[props.rotateDirection]);

const initialTransform = computed(() => {
  if (props.rotateDirection === "top" || props.rotateDirection === "bottom")
    return "translateZ(-0.5lh)";
  return "rotateY(90deg) translateX(50%) rotateY(-90deg)";
});

const frontFaceTransform = computed(() => {
  if (props.rotateDirection === "top" || props.rotateDirection === "bottom")
    return "translateZ(0.5lh)";
  return props.rotateDirection === "left"
    ? "rotateY(90deg) translateX(50%) rotateY(-90deg)"
    : "rotateY(-90deg) translateX(50%) rotateY(90deg)";
});

const secondFaceTransform = computed(() => ({
  top: "rotateX(-90deg) translateZ(0.5lh)",
  right: "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)",
  bottom: "rotateX(90deg) translateZ(0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(50%) rotateY(-90deg) translateX(50%)",
})[props.rotateDirection]);

function updateAnimation() {
  if (!scope.value)
    return;

  animation?.stop();
  const active = (isHovering.value || isFocused.value) && reducedMotion.value !== "reduce";
  const transition = active
    ? { ...props.transition, delay: stagger(props.staggerDuration, { from: props.staggerFrom }) }
    : { duration: reducedMotion.value === "reduce" ? 0 : 0.25, ease: "easeOut" as const };

  animation = animate(
    "[data-screw-char]",
    { transform: active ? rotationTransform.value : initialTransform.value },
    transition,
  );
}

watch([isHovering, isFocused, reducedMotion], updateAnimation);
onBeforeUnmount(() => animation?.stop());
</script>

<template>
  <component
    :is="props.as"
    v-bind="$attrs"
    :class="cn('relative inline-flex items-center', props.class)"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    @focusin="isFocused = true"
    @focusout="isFocused = false"
  >
    <span class="sr-only">{{ props.label }}</span>
    <span
      ref="scope" aria-hidden="true" class="
        inline-flex flex-wrap perspective-[1000px] transform-3d
      "
    >
      <span
        v-for="(word, wordIndex) in words" :key="wordIndex" class="inline-flex"
      >
        <span
          v-for="(character, characterIndex) in word.characters"
          :key="`${wordIndex}-${characterIndex}`"
          data-screw-char
          class="
            inline-block transform-3d
            motion-safe:will-change-transform
          "
          :style="{ transform: initialTransform }"
        >
          <span :class="cn('relative block h-lh backface-hidden', props.frontFaceClass)" :style="{ transform: frontFaceTransform }">{{ character }}</span>
          <span :class="cn('absolute top-0 left-0 block h-lh backface-hidden', props.secondFaceClass)" :style="{ transform: secondFaceTransform }">{{ character }}</span>
        </span>
        <span v-if="word.needsSpace" class="whitespace-pre">&nbsp;</span>
      </span>
    </span>
    <slot />
  </component>
</template>
