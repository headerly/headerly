<script lang="ts" setup>
import { cn } from "@headerly/ui/lib/utils";

interface ShimmerButtonProps {
  is?: "button" | "a";
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  class?: string;
}

withDefaults(defineProps<ShimmerButtonProps>(), {
  is: "button",
  shimmerColor: "var(--foreground)",
  shimmerSize: "0.05em",
  shimmerDuration: "3s",
  borderRadius: "100px",
  background: "var(--background)",
});
</script>

<template>
  <component
    :is
    :type="is === 'button' ? 'button' : undefined"
    :style="{
      '--spread': '90deg',
      '--shimmer-color': shimmerColor,
      '--radius': borderRadius,
      '--speed': shimmerDuration,
      '--cut': shimmerSize,
      '--bg': background,
    }"
    :class="
      cn(
        `
          group relative z-0 flex transform-gpu cursor-pointer items-center
          justify-center overflow-hidden [border-radius:var(--radius)] border
          border-border px-6 py-3 whitespace-nowrap text-foreground
          transition-transform duration-300 ease-in-out [background:var(--bg)]
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-ring
          active:translate-y-px
          disabled:pointer-events-none disabled:opacity-50
          motion-reduce:transition-none
        `,
        $props.class,
      )
    "
  >
    <div
      aria-hidden="true" class="
        @container-[size] pointer-events-none absolute inset-0 -z-30
        overflow-visible blur-xs
      "
    >
      <div
        class="
          absolute inset-0 aspect-square h-[100cqh]
          animate-[shimmer-btn-shimmer-slide_var(--speed)_ease-in-out_infinite_alternate]
          rounded-none [mask:none]
          motion-reduce:animate-none
        "
      >
        <div
          class="
            absolute -inset-full w-auto [translate:0_0] rotate-0
            animate-[shimmer-btn-spin-around_calc(var(--speed)*2)_linear_infinite]
            [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]
            motion-reduce:animate-none
          "
        />
      </div>
    </div>
    <span class="relative z-10 inline-flex items-center gap-2"><slot /></span>

    <div
      aria-hidden="true" class="
        pointer-events-none absolute inset-0 size-full transform-gpu rounded-2xl
        px-4 py-1.5 text-sm font-medium
        shadow-[inset_0_-8px_10px_color-mix(in_oklch,var(--foreground)_12%,transparent)]
        transition-all duration-300 ease-in-out
        group-hover:shadow-[inset_0_-6px_10px_color-mix(in_oklch,var(--foreground)_25%,transparent)]
        group-active:shadow-[inset_0_-10px_10px_color-mix(in_oklch,var(--foreground)_25%,transparent)]
      "
    />

    <div
      aria-hidden="true" class="
        pointer-events-none absolute inset-(--cut) -z-20
        [border-radius:var(--radius)] [background:var(--bg)]
      "
    />
  </component>
</template>

<style>
@keyframes shimmer-btn-shimmer-slide {
  to {
    transform: translate(calc(100cqw - 100%), 0);
  }
}

@keyframes shimmer-btn-spin-around {
  0% {
    transform: translateZ(0) rotate(0);
  }
  15%,
  35% {
    transform: translateZ(0) rotate(90deg);
  }
  65%,
  85% {
    transform: translateZ(0) rotate(270deg);
  }
  100% {
    transform: translateZ(0) rotate(360deg);
  }
}
</style>
