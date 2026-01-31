<script setup lang="ts">
import type { ActionType, HeaderMod, HeaderModOperation } from "@/lib/type";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import { Button } from "#/ui/button";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxViewport,
} from "#/ui/combobox";
import { Input } from "#/ui/input";
import { Label } from "#/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { computed } from "vue";
import {
  AUTOCOMPLETE_APPEND_REQUEST_FIELDS,
  AUTOCOMPLETE_RESPONSE_FIELDS,
  AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS,
} from "@/entrypoints/popup/constants/header";
import { cn } from "@/lib/utils";

const list = defineModel<HeaderMod[]>("list", {
  required: true,
});

const field = defineModel<HeaderMod>("field", {
  required: true,
});

const { actionType, index } = defineProps<{
  actionType: ActionType;
  index: number;
}>();

function getAutocompleteList(actionType: ActionType, operation: HeaderModOperation) {
  if (actionType === "response") {
    return AUTOCOMPLETE_RESPONSE_FIELDS;
  } else if (operation === "append") {
    return AUTOCOMPLETE_APPEND_REQUEST_FIELDS;
  } else {
    return AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS;
  }
}

const autocompleteList = computed(() => {
  const query = field.value.name.toLowerCase();
  const list = getAutocompleteList(actionType, field.value.operation);
  if (!query)
    return list;
  return list.filter(item => item.toLowerCase().includes(query) && item !== field.value.name);
});

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
    <Label class="flex flex-1">
      <slot name="field-before" />
      <div class="flex flex-1 gap-1">
        <Combobox
          v-model:search-term="field.name"
          :model-value="field.name"
          class="flex-1"
          @update:model-value="(val) => {
            if (typeof val === 'string') field.name = val;
          }"
        >
          <ComboboxAnchor class="w-full">
            <ComboboxInput
              v-model="field.name"
              placeholder="Name"
              class="
                w-full text-base
                placeholder:italic
              "
            />
          </ComboboxAnchor>

          <ComboboxList v-if="autocompleteList.length > 0">
            <ComboboxViewport>
              <ComboboxItem
                v-for="option in autocompleteList"
                :key="option"
                :value="option"
              >
                {{ option }}
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxList>
        </Combobox>
        <Label v-if="field.operation !== 'remove'" class="flex-1">
          <Input
            v-model.trim.lazy="field.value"
            type="text"
            placeholder="Value"
            class="
              text-base
              placeholder:italic
            "
          />
        </Label>
      </div>
    </Label>
    <div class="flex items-center gap-0.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon-xs"
              variant="secondary"
              :class="cn(`whitespace-nowrap`)"
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
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" :collision-padding="20">
            <p>Current operation: {{ field.operation }}</p>
            <p>Switch to {{ nextOperation.label }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        size="icon-xs"
        variant="secondary"
        class="text-destructive!"
        @click="() => {
          list.splice(index, 1);
        }"
      >
        <span class="sr-only">Delete this header mod</span>
        <i class="i-lucide-x size-4" />
      </Button>
      <ActionsDropdown
        v-model:list="list"
        v-model:field="field"
        :index
      />
    </div>
  </div>
</template>
