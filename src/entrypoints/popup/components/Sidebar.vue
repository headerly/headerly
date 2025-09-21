<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../useProfilesStore";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const store = useProfilesStore();
</script>

<template>
  <div
    :class="cn('bg-base-200 p-1', className)"
  >
    <ul class="flex flex-col gap-1 rounded-box bg-base-200">
      <li>
        <button
          data-tip="Create new profile"
          class="
            tooltip btn tooltip-right btn-square btn-soft btn-sm btn-primary
          "
          @click="store.addProfile"
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
        v-for="profile in store.profiles" :key="profile.id"
      >
        <button
          :class="cn(
            'tooltip btn tooltip-right btn-square btn-soft btn-sm',
            { 'btn-active btn-primary': store.selectedProfileId === profile.id },
          )"
          :data-tip="profile.name"
          @click="store.selectedProfileId = profile.id"
        >
          <span class="sr-only">{{ profile.name }}</span>
          <i class="i-lucide-file size-4" />
        </button>
      </li>
    </ul>
  </div>
</template>
