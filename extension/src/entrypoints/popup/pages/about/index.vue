<script setup lang="ts">
import { Button } from "#/ui/button";
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
            absolute inset-0 size-full scale-[0.80] rounded-full bg-destructive
            bg-linear-to-r from-sky-500 to-green-500 blur-3xl
          "
        />
        <div
          class="
            relative flex h-full flex-col items-start justify-end
            overflow-hidden rounded-2xl border bg-primary-foreground px-4 py-8
            shadow-xl
          "
        >
          <Button
            as-child
            variant="secondary"
            size="icon-xs"
            class="mb-4 rounded-full border transition"
          >
            <RouterLink
              to="/profiles"
            >
              <i class="i-lucide-arrow-left size-3" />
              <span class="sr-only">Back to profiles</span>
            </RouterLink>
          </Button>

          <h1
            class="relative z-50 mb-4 flex items-center gap-2 text-xl font-bold"
          >
            {{ name }} © 2025
            <span class="font-mono text-xs font-normal">
              v{{ version }}
            </span>
          </h1>

          <p
            class="relative z-50 mb-4 text-base font-normal"
          >
            {{ description }}
          </p>

          <Meteors />

          <div class="flex gap-2">
            <Button
              as-child
              variant="secondary"
              class="relative z-50 mt-4 flex items-center gap-2"
            >
              <a
                href="https://github.com/headerly/headerly"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="i-lucide-github size-4" />
                GitHub & MIT
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
