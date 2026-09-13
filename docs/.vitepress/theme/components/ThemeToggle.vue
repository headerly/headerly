<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";

const { isDark } = useData();
const label = computed(() => isDark.value ? "Switch to light theme" : "Switch to dark theme");

function toggleTheme() {
  isDark.value = !isDark.value;
}
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    data-allow-mismatch="attribute"
    class="
      inline-flex size-8 items-center justify-center rounded-md text-foreground
      transition-colors
      hover:bg-muted hover:text-brand
      focus-visible:outline-2 focus-visible:outline-offset-2
      focus-visible:outline-ring
      motion-reduce:transition-none
    "
    @click="toggleTheme"
  >
    <i
      class="
        i-lucide-moon hidden size-5
        dark:block
      " aria-hidden="true"
    />
    <i
      class="
        i-lucide-sun block size-5
        dark:hidden
      " aria-hidden="true"
    />
  </button>
</template>
