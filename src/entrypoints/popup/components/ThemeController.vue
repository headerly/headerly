<script setup lang="ts">
import { watch } from "vue";
import { cn } from "@/lib/utils";
import { themes } from "../constants/themes";
import { useSettingsStore } from "../stores/useSettingsStore";

const { class: className } = defineProps<{
  class?: string;
}>();

const settingsStore = useSettingsStore();

watch(
  () => settingsStore.theme,
  (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  },
);
</script>

<template>
  <div
    :class="cn('dropdown dropdown-end block', className)"
  >
    <div
      tabindex="0"
      role="button"
      class="group btn gap-1.5 px-1.5 btn-ghost btn-sm"
    >
      <div
        class="
          grid shrink-0 grid-cols-2 gap-0.5 rounded-md border
          border-base-content/10 bg-base-100 p-1 transition-colors
          group-hover:border-base-content/20
        "
      >
        <div class="size-1 rounded-full bg-base-content" />
        <div class="size-1 rounded-full bg-primary" />
        <div class="size-1 rounded-full bg-secondary" />
        <div class="size-1 rounded-full bg-accent" />
      </div>
      <i class="i-lucide-chevron-down size-3" />
    </div>

    <div
      tabindex="0"
      class="
        dropdown-content top-px h-[30.5rem] max-h-[calc(100vh-8.6rem)]
        overflow-y-auto rounded-box
        border-[length:var(--border)]
        border-white/5 bg-base-200 text-base-content shadow-2xl
        outline-[length:var(--border)]
        outline-black/5
      "
    >
      <ul class="menu w-56">
        <li class="menu-title text-xs">
          Themes
        </li>

        <li v-for="theme in themes" :key="theme">
          <button
            class="gap-3 px-2"
            :data-set-theme="theme"
            @click="settingsStore.setTheme(theme)"
          >
            <div
              :data-theme="theme"
              class="
                grid shrink-0 grid-cols-2 gap-0.5 rounded-md bg-base-100 p-1
                shadow-sm
              "
            >
              <div class="size-1 rounded-full bg-base-content" />
              <div class="size-1 rounded-full bg-primary" />
              <div class="size-1 rounded-full bg-secondary" />
              <div class="size-1 rounded-full bg-accent" />
            </div>
            <div class="w-32 truncate">
              {{ theme }}
            </div>
            <i
              v-show="settingsStore.theme === theme" class="
                i-lucide-check size-3 shrink-0
              "
            />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
