<script setup lang="ts">
import type { HeaderModOperation } from "@/lib/storage";
import { computed } from "vue";
import {
  AUTOCOMPLETE_APPEND_REQUEST_FIELDS,
  AUTOCOMPLETE_RESPONSE_FIELDS,
  AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS,
} from "@/entrypoints/popup/constants/header";
import { useProfilesStore } from "../stores/useProfilesStore";

const { type } = defineProps<{
  type: "request" | "response";
}>();

const AUTOCOMPLETE_LIST_ID_PREFIX = "AUTOCOMPLETE_LIST_ID";

function getAutocompleteList(operation: HeaderModOperation) {
  if (type === "response") {
    return AUTOCOMPLETE_RESPONSE_FIELDS;
  } else if (operation === "append") {
    return AUTOCOMPLETE_APPEND_REQUEST_FIELDS;
  } else {
    return AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS;
  }
}

function autocomplete(input: string, operation: HeaderModOperation) {
  if (!input) {
    return [];
  }
  const list = getAutocompleteList(operation);
  return list.filter(field => field.includes(input) && field !== input);
}
const profilesStore = useProfilesStore();

const currentMods = computed(() => (
  type === "request"
    ? profilesStore.selectedProfile.requestHeaderMods
    : profilesStore.selectedProfile.responseHeaderMods
));
</script>

<template>
  <fieldset
    class="fieldset w-full rounded-box border border-base-300 bg-base-200 p-4"
  >
    <legend class="fieldset-legend text-base">
      <label>
        <input
          type="checkbox" class="checkbox checkbox-sm"
          :checked="currentMods.every(mod => mod.enabled)"
          :indeterminate="currentMods.some(mod => mod.enabled)
            && !currentMods.every(mod => mod.enabled)"
          @change="(e) => {
            const checked = (e.target as HTMLInputElement).checked;
            currentMods.forEach(mod => {
              mod.enabled = checked;
            });
          }"
        >
      </label>
      {{ type === "request" ? "Request Headers" : "Response Headers" }}
      <button
        class="btn btn-square btn-ghost btn-xs btn-primary"
        @click="profilesStore.addHeaderAction(type)"
      >
        <i class="i-lucide-cross size-4" />
      </button>
    </legend>
    <div
      v-for="mod in currentMods"
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
          <datalist :id="`${AUTOCOMPLETE_LIST_ID_PREFIX}_${mod.id}`">
            <option
              v-for="field in autocomplete(mod.name, mod.operation)"
              :key="field"
              :value="field"
            />
          </datalist>
          <input
            v-model="mod.name"
            type="text"
            placeholder="Name"
            class="input input-sm w-full text-base text-base-content"
            :list="`${AUTOCOMPLETE_LIST_ID_PREFIX}_${mod.id}`"
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
          @click="profilesStore.deleteHeaderMod(type, mod.id)"
        >
          <i class="i-lucide-x size-4" />
        </button>
      </label>
      <button
        class="btn ml-6.5 w-min whitespace-nowrap btn-soft btn-xs"
        @click="profilesStore.switchHeaderActionOperation(type, mod.id)"
      >
        Operation: <span class="capitalize">{{ mod.operation }}</span>
        <i class="i-lucide-refresh-cw size-3" />
      </button>
    </div>
  </fieldset>
</template>
