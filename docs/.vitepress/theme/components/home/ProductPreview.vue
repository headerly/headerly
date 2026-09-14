<script setup lang="ts">
import { SafariMockup } from "@headerly/ui/components/safari-mockup";
import largeDarkScreenshot from "../../assets/popup-screenshot-large-dark.webp";
import largeLightScreenshot from "../../assets/popup-screenshot-large-light.webp";
import smallDarkScreenshot from "../../assets/popup-screenshot-small-dark.webp";
import smallLightScreenshot from "../../assets/popup-screenshot-small-light.webp";
</script>

<template>
  <figure class="mx-auto mb-12 w-full max-w-210">
    <SafariMockup
      class="
        block h-auto w-full rounded-lg shadow-[0_24px_64px_-24px_rgb(0_0_0/25%)]
      "
      url="chrome-extension://ddfhnefglieahhomhocghnhjhloaljmn/popup.html#/"
      role="img"
      aria-label="Headerly staging API profile with environment and feature flag request headers, cache-control response headers, domain switching, and resource type filters."
    >
      <!-- Theme visibility follows VitePress's pre-paint .dark class, including saved preferences. -->
      <picture
        class="
          block
          dark:hidden
        "
      >
        <source media="(max-width: 640px)" :srcset="smallLightScreenshot" width="1200" height="960">
        <img
          fetchpriority="high"
          :src="largeLightScreenshot" width="1200" height="900" alt="" class="
            block h-auto w-full
          "
        >
      </picture>
      <picture
        class="
          hidden
          dark:block
        "
      >
        <source media="(max-width: 640px)" :srcset="smallDarkScreenshot" width="1200" height="960">
        <img
          fetchpriority="high"
          :src="largeDarkScreenshot" width="1200" height="900" alt="" class="
            block h-auto w-full
          "
        >
      </picture>
    </SafariMockup>
  </figure>
</template>
