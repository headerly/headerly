<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../stores/useProfilesStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import ProfileSelect from "./ProfileSelect.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
</script>

<template>
  <div
    :class="cn('flex h-full flex-col justify-between bg-base-200 py-2', className)"
  >
    <ul
      class="flex flex-col items-center gap-1 rounded-box bg-base-200"
    >
      <li>
        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                class="btn btn-square btn-soft btn-sm"
                @click="profilesStore.addProfile"
              >
                <i class="i-lucide-plus size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Create new profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </li>
      <li>
        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                data-tip="Search profile"
                class="btn btn-square btn-soft btn-sm"
              >
                <i class="i-lucide-search size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Search profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </li>
    </ul>

    <div class="divider m-0" />

    <div
      class="flex flex-1 flex-col gap-1 overflow-y-hidden"
    >
      <ProfileSelect v-if="profilesStore.orderedProfiles.length && profilesStore.selectedProfileId" />
    </div>

    <div class="divider m-0" />

    <div class="flex flex-col items-center">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              :class="cn(
                'btn btn-square btn-soft btn-sm',
                settingsStore.powerOn ? 'btn-error' : 'btn-primary',
              )"
              @click="settingsStore.togglePower"
            >
              <i class="i-lucide-power size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ settingsStore.powerOn ? 'Turn off extension' : 'Turn on extension' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
