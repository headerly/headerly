<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBrowserApiService } from "@/entrypoints/background/BrowserApiService";
import { cn } from "@/lib/utils";
import ProfileSelect from "./components/ProfileSelect.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();

const { openInFullscreen } = getBrowserApiService();

const isDEV = import.meta.env.DEV;
</script>

<template>
  <aside
    :class="cn('flex h-full flex-col justify-between bg-base-200 py-2', className)"
  >
    <div class="dropdown-hover dropdown dropdown-right px-2">
      <div
        tabindex="0"
        role="button"
        :class="cn(
          'btn btn-square btn-soft btn-sm',
          settingsStore.powerOn || 'opacity-60',
        )"
        @click="profilesStore.addProfile"
      >
        <i class="i-lucide-menu size-4" />
      </div>

      <ul
        tabindex="0" class="
          dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm
        "
      >
        <li class="gap-1 font-medium">
          <button class="flex flex-row items-center gap-2" @click="profilesStore.addProfile">
            <i class="i-lucide-cross size-4" />
            <span>Add New Profile</span>
          </button>
          <button
            v-if="isDEV"
            class="flex flex-row items-center gap-2"
            @click="openInFullscreen"
          >
            <i class="i-lucide-maximize size-4" />
            <span>Expand to Full Tab</span>
          </button>
          <RouterLink to="/settings" class="flex flex-row items-center gap-2">
            <i class="i-lucide-settings size-4" />
            <span>Settings</span>
          </RouterLink>
          <RouterLink to="/about" class="flex flex-row items-center gap-2">
            <i class="i-lucide-badge-info size-4" />
            <span>About</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="divider m-0" />

    <div
      :class="cn(
        'flex flex-1 flex-col gap-1 overflow-y-hidden',
        settingsStore.powerOn || `opacity-60`,
      )"
    >
      <ProfileSelect />
    </div>

    <div class="divider m-0" />

    <div class="flex flex-col items-center">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <label
              :class="cn(
                'btn btn-square btn-soft btn-sm',
                settingsStore.powerOn ? 'btn-error' : `
                  animate-pulse btn-success
                `,
              )"
            >
              <i class="i-lucide-power size-4" />
              <input
                v-model="settingsStore.powerOn"
                type="checkbox"
                class="sr-only"
              >
            </label>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ settingsStore.powerOn ? 'Turn off extension' : 'Turn on extension' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </aside>
</template>
