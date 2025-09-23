<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../stores/useProfilesStore";
import { useSettingsStore } from "../stores/useSettingsStore";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
</script>

<template>
  <div
    :class="cn('flex flex-col justify-between bg-base-200 p-1', className)"
  >
    <ul class="flex flex-col gap-1 rounded-box bg-base-200">
      <li>
        <button
          data-tip="Create new profile"
          class="
            tooltip btn tooltip-right btn-square btn-soft btn-sm btn-primary
          "
          @click="profilesStore.addProfile"
        >
          <i class="i-lucide-file-plus size-4" />
        </button>
      </li>
      <li>
        <button
          data-tip="Search profile"
          class="
            tooltip btn tooltip-right btn-square btn-soft btn-sm btn-primary
          "
        >
          <i class="i-lucide-search size-4" />
        </button>
      </li>
      <li
        v-for="profile in profilesStore.profiles" :key="profile.id"
      >
        <div class="indicator">
          <button
            :class="cn(
              'tooltip btn tooltip-right btn-square btn-soft btn-sm',
              { 'btn-active btn-primary': profilesStore.selectedProfileId === profile.id },
            )"
            :data-tip="profile.name"
            @click="profilesStore.selectedProfileId = profile.id"
          >
            <span class="sr-only">{{ profile.name }}</span>
            <i class="i-lucide-file size-4" />
          </button>
          <span
            :class="cn('indicator-item status', profile.enabled ? `
              status-success
            ` : `status`)"
          />
        </div>
      </li>
    </ul>
    <div>
      <div class="divider" />
      <div>
        <button
          :class="cn(
            'tooltip btn tooltip-right btn-square w-full btn-soft btn-sm',
            settingsStore.powerOn ? 'btn-error' : 'btn-primary',
          )"
          :data-tip="settingsStore.powerOn ? 'Turn off extension' : 'Turn on extension'"
          @click="settingsStore.togglePower"
        >
          <i v-if="settingsStore.powerOn" class="i-lucide-power size-4" />
          <i v-else class="i-lucide-power-off size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
