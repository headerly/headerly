<script setup lang="ts">
import type { ActionType } from "#/stores/useProfilesStore";
import type { HeaderMod, HeaderModOperation } from "@/lib/type";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import {
  AUTOCOMPLETE_APPEND_REQUEST_FIELDS,
  AUTOCOMPLETE_RESPONSE_FIELDS,
  AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS,
} from "#/constants/header";
import { computed } from "vue";
import { cn } from "@/lib/utils";

const { actionType, index } = defineProps<{
  actionType: ActionType;
  index: number;
}>();

const list = defineModel<HeaderMod[]>("list", {
  required: true,
});

const field = defineModel<HeaderMod>("field", {
  required: true,
});

const AUTOCOMPLETE_LIST_ID_PREFIX = "AUTOCOMPLETE_LIST_ID_PREFIX";

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
  const currentIndex = supportedOperations.indexOf(field.value.operation);
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
          <datalist :id="`${AUTOCOMPLETE_LIST_ID_PREFIX}_${field.id}`">
            <option
              v-for="field in autocomplete(actionType, field.operation, field.name)"
              :key="field"
              :value="field"
            />
          </datalist>
          <input
            :value="field.name"
            type="text"
            placeholder="Name"
            class="
              input input-sm w-full text-base text-base-content
              placeholder:italic
            "
            :list="`${AUTOCOMPLETE_LIST_ID_PREFIX}_${field.id}`"
            @change="(e) => {
              // Although the HTTP standard considers header names to be case-insensitive,
              // `chrome.declarativeNetRequest` will report an error
              // when receiving a header name with uppercase characters.
              field.name = (e.target as HTMLInputElement).value.toLowerCase().trim()
            }"
          >
        </label>
        <label v-if="field.operation !== 'remove'" class="floating-label flex-1">
          <span>Value</span>
          <input
            v-model.trim.lazy="field.value"
            type="text"
            placeholder="Value"
            class="
              input input-sm text-base text-base-content
              placeholder:italic
            "
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
                'btn-accent': field.operation === 'set',
                'btn-info': field.operation === 'append',
                'btn-secondary': field.operation === 'remove',
              })"
              @click="() => {
                field.operation = nextOperation.value;
              }"
            >
              <i
                :class="cn('size-4', {
                  'i-lucide-equal': field.operation === 'set',
                  'i-lucide-plus': field.operation === 'append',
                  'i-lucide-minus': field.operation === 'remove',
                })"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" :collision-padding="20">
            <p>Current operation: {{ field.operation }}</p>
            <p>Switch to {{ nextOperation.label }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button
        class="btn btn-square btn-ghost btn-xs btn-error"
        @click="() => {
          list.splice(index, 1);
        }"
      >
        <span class="sr-only">Delete this header mod</span>
        <i class="i-lucide-x size-4" />
      </button>
      <ActionsDropdown
        v-model:list="list"
        v-model:field="field"
        :index
      />
    </div>
  </div>
</template>
