<script lang="ts" setup>
function openInFullscreen() {
  browser.tabs.create({ url: "popup.html" });
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      class="relative flex h-120 w-150 flex-col rounded-sm outline-2"
    >
      <header class="flex items-center justify-end border-b border-primary p-1">
        <button
          class="btn btn-square btn-sm" @click="openInFullscreen"
        >
          <span class="sr-only">Open in fullscreen</span>
          <i class="i-lucide-fullscreen size-4" />
        </button>
      </header>
    </div>
  </div>
</template>
