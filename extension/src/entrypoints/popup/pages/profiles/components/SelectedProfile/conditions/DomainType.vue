<script setup lang="ts">
import type { Filter } from "@/lib/type";
import Fieldset from "#/components/group/Fieldset.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

const model = defineModel<NonNullable<Filter["domainType"]>>({
  required: true,
});

const profilesStore = useProfilesStore();
</script>

<template>
  <Fieldset
    name="Domain Type"
  >
    <template #main>
      <div class="flex items-center gap-2">
        <label class="label text-base-content gap-2 text-base">
          <input
            v-model="model.value"
            type="radio"
            value="firstParty"
            class="radio radio-sm"
          >
          First Party
        </label>
        <label class="label text-base-content gap-2 text-base">
          <input
            v-model="model.value"
            type="radio"
            value="thirdParty"
            class="radio radio-sm"
          >
          Third Party
        </label>
      </div>
    </template>
    <template #name-before>
      <input
        v-model="model.enabled"
        type="checkbox"
        class="checkbox checkbox-sm"
      >
    </template>
    <template #name-after>
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="btn btn-square btn-ghost btn-xs btn-error"
              @click="() => {
                delete profilesStore.selectedProfile.filters.domainType
              }"
            >
              <i class="i-lucide-trash size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Delete this condition
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </template>
  </fieldset>
</template>
