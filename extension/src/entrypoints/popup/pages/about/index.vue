<script setup lang="ts">
import Meteors from "./components/Meteors.vue";

const version = browser.runtime.getManifest().version;
const description = browser.runtime.getManifest().description;
const name = browser.runtime.getManifest().name;
</script>

<template>
  <div
    class="grid size-full place-items-center overflow-hidden"
  >
    <div class="flex w-full flex-col items-center justify-center">
      <div class="relative w-full max-w-xs">
        <div
          class="
            bg-error from-info to-success absolute inset-0 size-full
            scale-[0.80] rounded-full bg-gradient-to-r blur-3xl
          "
        />
        <div
          class="
            border-base-100 bg-base-200 relative flex h-full flex-col
            items-start justify-end overflow-hidden rounded-2xl border px-4 py-8
            shadow-xl
          "
        >
          <RouterLink
            to="/profiles"
            class="
              border-base-content/33 text-base-content/66 mb-4 flex size-5
              items-center justify-center rounded-full border transition
              hover:border-base-content hover:text-base-content
            "
          >
            <i class="i-lucide-arrow-left size-3" />
            <span class="sr-only">Back to profiles</span>
          </RouterLink>

          <h1
            class="
              text-base-content relative z-50 mb-4 flex items-center gap-2
              text-xl font-bold
            "
          >
            {{ name }} © 2025
            <div class="border-base-content/33 font-mono text-xs font-normal">
              v{{ version }}
            </div>
          </h1>

          <p
            class="
              text-base-content/66 relative z-50 mb-4 text-base font-normal
            "
          >
            {{ description }}
          </p>

          <Meteors />

          <div class="flex gap-2">
            <VButton
              as-child
              class="relative z-50 mt-4 flex items-center gap-2"
            >
              <a
                href="https://github.com/headerly/headerly"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="i-lucide-github text-base-content/66 size-4" />
                GitHub & MIT
              </a>
            </VButton>
            <!-- <a
              rel="noopener noreferrer"
              href="https://headerly.dev/docs"
              target="_blank"
              class="
                btn relative z-50 mt-4 flex items-center gap-2 btn-ghost btn-sm
              "
            >
              <i class="i-lucide-book-open size-4 text-base-content/66" />
              Documentation
            </a> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
