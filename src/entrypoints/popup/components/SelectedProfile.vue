<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  AUTOCOMPLETE_APPEND_REQUEST_FIELDS,
  AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS,
} from "@/entrypoints/popup/constants/header";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../stores/useProfilesStore";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();

const APPEND_REQUEST_LIST_ID = "AUTOCOMPLETE_APPEND_REQUEST_FIELDS";
const SET_AND_REMOVE_REQUEST_LIST_ID = "AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS";

function getAutocompleteList(list: string[], input: string) {
  if (!input) {
    return [];
  }
  return list.filter(field => field.includes(input) && field !== input);
}
</script>

<template>
  <div
    :class="cn(profilesStore.selectedProfile.enabled ? 'opacity-100' : `
      opacity-50
    `, className)"
  >
    <fieldset
      v-if="profilesStore.selectedProfile.requestHeaderMods.length"
      class="fieldset w-full rounded-box border border-base-300 bg-base-200 p-4"
    >
      <legend class="fieldset-legend text-base">
        <label>
          <input
            type="checkbox" class="checkbox checkbox-sm"
            :checked="profilesStore.selectedProfile.requestHeaderMods.every(mod => mod.enabled)"
            :indeterminate="profilesStore.selectedProfile.requestHeaderMods.some(mod => mod.enabled)
              && !profilesStore.selectedProfile.requestHeaderMods.every(mod => mod.enabled)"
            @change="(e) => {
              const checked = (e.target as HTMLInputElement).checked;
              profilesStore.selectedProfile.requestHeaderMods.forEach(mod => {
                mod.enabled = checked;
              });
            }"
          >
        </label>
        Reuqest Headers
        <button
          class="btn btn-square btn-ghost btn-xs btn-primary"
          @click="profilesStore.addRequestHeaderMod('set')"
        >
          <i class="i-lucide-plus size-4" />
        </button>
      </legend>
      <div
        v-for="mod in profilesStore.selectedProfile.requestHeaderMods"
        :key="mod.id"
        class="flex flex-col gap-1.5"
      >
        <label
          class="label flex"
        >
          <input
            v-model="mod.enabled" type="checkbox"
            class="checkbox checkbox-sm"
          >
          <label class="flex-1">
            <datalist v-if="mod.operation === 'append'" :id="APPEND_REQUEST_LIST_ID">
              <option
                v-for="field in getAutocompleteList(AUTOCOMPLETE_APPEND_REQUEST_FIELDS, mod.name)"
                :key="field"
                :value="field"
              />
            </datalist>
            <datalist v-else :id="SET_AND_REMOVE_REQUEST_LIST_ID">
              <option
                v-for="field in getAutocompleteList(AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS, mod.name)"
                :key="field"
                :value="field"
              />
            </datalist>
            <input
              v-model="mod.name"
              type="text"
              placeholder="Name"
              class="input input-sm w-full text-base text-base-content"
              :list="mod.operation === 'append' ? APPEND_REQUEST_LIST_ID : SET_AND_REMOVE_REQUEST_LIST_ID"
              @input="(e) => {
                // Although the HTTP standard considers header names to be case-insensitive,
                // `chrome.declarativeNetRequest` will report an error
                // when receiving a header name with uppercase characters.
                mod.name = (e.target as HTMLInputElement).value.toLowerCase();
              }"
            >
          </label>
          <label v-if="mod.operation !== 'remove'" class="flex-1">
            <input
              v-model="mod.value"
              type="text"
              placeholder="Value"
              class="input input-sm text-base text-base-content"
            >
          </label>
          <button
            class="btn btn-square btn-ghost btn-xs btn-error"
            @click="profilesStore.deleteRequestHeaderMod(mod.id)"
          >
            <i class="i-lucide-x size-4" />
          </button>
        </label>
        <button
          class="btn ml-6.5 w-min whitespace-nowrap btn-soft btn-xs"
          @click="profilesStore.switchRequestHeaderModOperation(mod.id)"
        >
          Operation: <span class="capitalize">{{ mod.operation }}</span>
          <i class="i-lucide-refresh-cw size-3" />
        </button>
      </div>
    </fieldset>
  </div>
</template>
