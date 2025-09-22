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
  <div :class="cn(store.selectedProfile?.enabled ? 'opacity-100' : 'opacity-50', className)">
    <fieldset
      v-if="store.selectedProfile?.requestHeaderMods?.length"
      class="fieldset w-full rounded-box border border-base-300 bg-base-200 p-4"
    >
      <legend class="fieldset-legend text-base">
        <label>
          <input
            type="checkbox" class="checkbox checkbox-sm"
            :checked="store.selectedProfile.requestHeaderMods.every(mod => mod.enabled)"
            :indeterminate="store.selectedProfile.requestHeaderMods.some(mod => mod.enabled)
              && !store.selectedProfile.requestHeaderMods.every(mod => mod.enabled)"
            @change="(e) => {
              const checked = (e.target as HTMLInputElement).checked;
              store.selectedProfile?.requestHeaderMods?.forEach(mod => {
                mod.enabled = checked;
              });
            }"
          >
        </label>
        Reuqest Headers
        <button
          class="btn btn-square btn-ghost btn-xs btn-primary"
          @click="store.addRequestHeaderMod('set')"
        >
          <i class="i-lucide-plus size-4" />
        </button>
      </legend>
      <label
        v-for="mod of store.selectedProfile.requestHeaderMods"
        :key="mod.id"
        class="label"
      >
        <input
          v-model="mod.enabled" type="checkbox"
          class="checkbox checkbox-sm"
        >
        <label
          class="flex-1"
          :data-tip="`Operation: ${mod.operation}`"
        >
          <input
            v-model="mod.name" type="text" placeholder="Name" class="
              peer input input-sm text-base
            "
          >
        </label>
        <label class="flex-1">
          <input
            v-model="mod.value" type="text" placeholder="Value" class="
              input input-sm text-base
            "
          >
        </label>

        <button
          class="btn btn-square btn-ghost btn-xs btn-error"
          @click="store.deleteRequestHeaderMod(mod.id)"
        >
          <i class="i-lucide-x size-4" />
        </button>
      </label>
    </fieldset>
  </div>
</template>
