<script setup lang="ts">
import type { BrowserHints, BrowserStore } from "./browserDownloads";
import { RainbowButton } from "@headerly/ui/components/rainbow-button";
import { withBase } from "vitepress";
import { computed, onMounted, ref } from "vue";
import { browserStores, detectBrowserStore, isMobileBrowser } from "./browserDownloads";

const preferred = ref<BrowserStore>("chrome");
const mobile = ref(false);
const primary = computed(() => browserStores[preferred.value]);
const secondary = computed(() => browserStores[preferred.value === "edge" ? "chrome" : "edge"]);

onMounted(() => {
  const hints = (navigator as Navigator & { userAgentData?: BrowserHints }).userAgentData;
  preferred.value = detectBrowserStore(navigator.userAgent, hints);
  mobile.value = isMobileBrowser(navigator.userAgent, hints);
});
</script>

<template>
  <div class="vp-raw flex flex-col items-start gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <RainbowButton
        is="a" :href="primary.href" target="_blank" rel="noopener noreferrer" data-download="primary" class="
          h-12 gap-3 px-5 text-sm no-underline
        "
      >
        <img
          :src="withBase(primary.logo)" alt="" width="22" height="22" class="
            no-zoom size-5.5
          "
        >
        {{ mobile ? `Get for desktop ${primary.name}` : `Add to ${primary.name}` }}
        <i class="i-lucide-arrow-up-right size-4" aria-hidden="true" />
      </RainbowButton>
      <a
        :href="secondary.href" target="_blank" rel="noopener noreferrer" class="
          inline-flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground
          no-underline transition-colors
          hover:text-foreground
        " data-download="secondary"
      >
        <img
          :src="withBase(secondary.logo)" alt="" width="18" height="18" class="
            no-zoom size-4.5
          "
        >
        Also for {{ secondary.name }}
      </a>
    </div>
  </div>
</template>
