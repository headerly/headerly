<script setup lang="ts">
import { useDocumentVisibility, useElementVisibility, usePreferredReducedMotion, useRafFn, useResizeObserver } from "@vueuse/core";
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";

interface Props {
  background?: string;
  particleColor?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleDensity?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
}

const props = withDefaults(defineProps<Props>(), {
  background: "transparent",
  particleColor: "currentColor",
  minSize: 0.6,
  maxSize: 1.8,
  speed: 0.5,
  particleDensity: 120,
});

const containerRef = useTemplateRef("containerRef");
const canvasRef = useTemplateRef("canvasRef");
const visible = useElementVisibility(containerRef);
const documentVisibility = useDocumentVisibility();
const reducedMotion = usePreferredReducedMotion();
const ready = ref(false);
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let width = 0;
let height = 0;
let themeObserver: MutationObserver | undefined;

function generateParticles() {
  // Keep the field sparse on smaller screens and bound its rendering cost.
  const count = Math.min(500, Math.max(0, Math.round(props.particleDensity * Math.min(1, width * height / 600000))));
  particles = Array.from({ length: count }, () => {
    const speedVariance = Math.random() * 0.3 + 0.7;
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.max(0.1, Math.random() * (props.maxSize - props.minSize) + props.minSize),
      vx: (Math.random() - 0.5) * 0.05 * speedVariance,
      vy: ((Math.random() - 0.5) * 0.05 - 0.015) * speedVariance,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.008 + Math.random() * 0.012,
    };
  });
}

function draw(delta = 0) {
  if (!ctx || !containerRef.value)
    return;

  // Coordinates stay in CSS pixels; the transform handles high-DPI rendering.
  const step = Math.min(delta, 50) / (1000 / 60);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = getComputedStyle(containerRef.value).color;
  for (const particle of particles) {
    particle.x = (particle.x + particle.vx * props.speed * step + 104) % 104;
    particle.y = (particle.y + particle.vy * props.speed * step + 104) % 104;
    particle.phase = (particle.phase + particle.phaseSpeed * step) % (Math.PI * 2);
    ctx.globalAlpha = 0.15 + (Math.sin(particle.phase) + 1) * 0.35;
    ctx.beginPath();
    ctx.arc(particle.x * width / 100, particle.y * height / 100, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container || !ctx)
    return;

  const rect = container.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  generateParticles();
  draw();
}

const { pause, resume } = useRafFn(({ delta }) => draw(delta), { immediate: false, fpsLimit: 30 });
useResizeObserver(containerRef, resizeCanvas);

watch([ready, visible, documentVisibility, reducedMotion], () => {
  if (ready.value && visible.value && documentVisibility.value === "visible" && reducedMotion.value !== "reduce") {
    resume();
  } else {
    pause();
    draw();
  }
});

watch(() => [props.particleDensity, props.minSize, props.maxSize], () => {
  generateParticles();
  draw();
});
watch(() => props.particleColor, () => draw(), { flush: "post" });

onMounted(() => {
  ctx = canvasRef.value?.getContext("2d") ?? null;
  if (!ctx)
    return;

  resizeCanvas();
  ready.value = true;
  // Redraw static particles when theme tokens change, including reduced-motion mode.
  themeObserver = new MutationObserver(() => draw());
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
});

onBeforeUnmount(() => {
  pause();
  themeObserver?.disconnect();
});
</script>

<template>
  <div
    ref="containerRef"
    aria-hidden="true"
    class="pointer-events-none relative size-full overflow-hidden"
    :style="{ background, color: particleColor }"
  >
    <canvas ref="canvasRef" class="absolute inset-0 size-full" />
  </div>
</template>
