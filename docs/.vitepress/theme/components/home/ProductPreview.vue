<script setup lang="ts">
import { SafariMockup } from "@headerly/ui/components/safari-mockup";
import { useData } from "vitepress";
import { computed, onMounted, onUnmounted, ref } from "vue";
import largeDarkScreenshot from "../../assets/popup-screenshot-large-dark.webp";
import largeLightScreenshot from "../../assets/popup-screenshot-large-light.webp";
import smallDarkScreenshot from "../../assets/popup-screenshot-small-dark.webp";
import smallLightScreenshot from "../../assets/popup-screenshot-small-light.webp";

const { isDark } = useData();
const isSmallScreen = ref(false);
const screenshot = computed(() => {
  if (isSmallScreen.value) {
    return isDark.value ? smallDarkScreenshot : smallLightScreenshot;
  }
  return isDark.value ? largeDarkScreenshot : largeLightScreenshot;
});
let smallScreenQuery: MediaQueryList | undefined;

function updateScreenSize() {
  isSmallScreen.value = smallScreenQuery?.matches ?? false;
}

onMounted(() => {
  smallScreenQuery = window.matchMedia("(max-width: 640px)");
  updateScreenSize();
  smallScreenQuery.addEventListener("change", updateScreenSize);
});

onUnmounted(() => smallScreenQuery?.removeEventListener("change", updateScreenSize));
</script>

<template>
  <figure class="mx-auto mb-12 w-full max-w-210">
    <SafariMockup
      class="
        block h-auto w-full rounded-lg shadow-[0_24px_64px_-24px_rgb(0_0_0/25%)]
      "
      :src="screenshot"
      :height="isSmallScreen ? 1013 : 953"
      url="chrome-extension://ddfhnefglieahhomhocghnhjhloaljmn/popup.html#/"
      role="img"
      aria-label="Headerly staging API profile with environment and feature flag request headers, cache-control response headers, domain switching, and resource type filters."
    />
  </figure>
</template>
