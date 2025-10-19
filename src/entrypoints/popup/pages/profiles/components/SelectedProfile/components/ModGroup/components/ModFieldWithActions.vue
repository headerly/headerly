<script setup lang="ts">
import type { ActionType } from "#/stores/useProfilesStore";
import type { HeaderMod, HeaderModOperation } from "@/lib/storage";
import {
  AUTOCOMPLETE_APPEND_REQUEST_FIELDS,
  AUTOCOMPLETE_RESPONSE_FIELDS,
  AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS,
} from "#/constants/header";
import { computed } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import ModActionsDropdown from "./ModActionsDropdown.vue";

const { actionType, mod, index } = defineProps<{
  actionType: ActionType;
  mod: HeaderMod;
  index: number;
  currentModsLength: number;
}>();

const emit = defineEmits<{
  (e: "update:name", value: string): void;
  (e: "update:value", value: string): void;
  (e: "update:comments", value: string): void;
  (e: "update:operation", value: HeaderModOperation): void;
  (e: "delete"): void;
  (e: "duplicate"): void;
  (e: "moveUp"): void;
  (e: "moveDown"): void;
}>();

const AUTOCOMPLETE_LIST_ID_PREFIX = "AUTOCOMPLETE_LIST_ID";

function getAutocompleteList(actionType: ActionType, operation: HeaderModOperation) {
  if (actionType === "response") {
    return AUTOCOMPLETE_RESPONSE_FIELDS;
  } else if (operation === "append") {
    return AUTOCOMPLETE_APPEND_REQUEST_FIELDS;
  } else {
    return AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS;
  }
}

function autocomplete(actionType: ActionType, operation: HeaderModOperation, input: string) {
  if (!input) {
    return [];
  }
  const list = getAutocompleteList(actionType, operation);
  return list.filter(field => field.includes(input) && field !== input);
}

const nextOperation = computed(() => {
  const supportedOperations = ["set", "append", "remove"] as const satisfies HeaderModOperation[];
  const currentIndex = supportedOperations.indexOf(mod.operation);
  const nextIndex = (currentIndex + 1) % supportedOperations.length;
  return {
    value: supportedOperations[nextIndex]!,
    label: supportedOperations[nextIndex]!.charAt(0).toUpperCase() + supportedOperations[nextIndex]!.slice(1),
  };
});
</script>

<template>
  <div class="flex flex-1 items-center justify-between gap-1">
    <label class="label flex flex-1">
      <slot name="field-before" />
      <div class="flex flex-1 gap-1">
        <label class="floating-label flex-1">
          <span>Name</span>
          <datalist :id="`${AUTOCOMPLETE_LIST_ID_PREFIX}_${mod.id}`">
            <option
              v-for="field in autocomplete(actionType, mod.operation, mod.name)"
              :key="field"
              :value="field"
            />
          </datalist>
          <input
            :value="mod.name"
            type="text"
            placeholder="Name"
            class="
              input input-sm w-full text-base text-base-content
              placeholder:italic
            "
            :list="`${AUTOCOMPLETE_LIST_ID_PREFIX}_${mod.id}`"
            @change="(e) => {
              // Although the HTTP standard considers header names to be case-insensitive,
              // `chrome.declarativeNetRequest` will report an error
              // when receiving a header name with uppercase characters.
              emit('update:name', (e.target as HTMLInputElement).value.toLowerCase().trim());
            }"
          >
        </label>
        <label v-if="mod.operation !== 'remove'" class="floating-label flex-1">
          <span>Value</span>
          <input
            :value="mod.value"
            type="text"
            placeholder="Value"
            class="
              input input-sm text-base text-base-content
              placeholder:italic
            "
            @change="(e) => emit('update:value', (e.target as HTMLInputElement).value.trim())"
          >
        </label>
      </div>
    </label>
    <div class="flex gap-0.5">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              :class="cn(`
                btn btn-square font-medium whitespace-nowrap btn-soft btn-xs
              `, {
                'btn-accent': mod.operation === 'set',
                'btn-info': mod.operation === 'append',
                'btn-secondary': mod.operation === 'remove',
              })"
              @click="() => {
                emit('update:operation', nextOperation.value);
              }"
            >
              <i
                :class="cn('size-3', {
                  'i-lucide-equal': mod.operation === 'set',
                  'i-lucide-plus': mod.operation === 'append',
                  'i-lucide-minus': mod.operation === 'remove',
                })"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" :collision-padding="20">
            <p>Current operation: {{ mod.operation }}</p>
            <p>Switch to {{ nextOperation.label }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button
        class="btn btn-square btn-ghost btn-xs btn-error"
        @click="emit('delete')"
      >
        <span class="sr-only">Delete this header mod</span>
        <i class="i-lucide-x size-4" />
      </button>
      <ModActionsDropdown
        :mod
        :index
        :type="actionType"
        :current-mods-length
        @update:comments="emit('update:comments', $event)"
        @duplicate="emit('duplicate')"
        @move-up="emit('moveUp')"
        @move-down="emit('moveDown')"
      />
    </div>
  </div>
</template>
