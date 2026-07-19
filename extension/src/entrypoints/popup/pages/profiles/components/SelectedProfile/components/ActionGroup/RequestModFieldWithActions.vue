<script setup lang="ts">
import type { HeaderMod } from "@/lib/schema";
import type { ActionType, HeaderModOperation } from "@/lib/types";

import { match } from "ts-pattern";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
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

const emit = defineEmits<{
  (e: "nameCommitted", name: string): void;
}>();

const { t } = useI18n();

let selectingAutocompleteOption: boolean = false;

function normalizeAndCommitHeaderName(name: string) {
  field.value.name = name.trim().toLocaleLowerCase();
  if (field.value.name)
    emit("nameCommitted", field.value.name);
}

function commitHeaderName() {
  if (!selectingAutocompleteOption)
    normalizeAndCommitHeaderName(field.value.name);
}

function startSelectingAutocompleteOption() {
  selectingAutocompleteOption = true;
}

function selectAutocompleteOption(value: unknown) {
  if (typeof value === "string")
    normalizeAndCommitHeaderName(value);

  selectingAutocompleteOption = false;
}

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
    label: getOperationLabel(supportedOperations[nextIndex]!),
  };
});

function getOperationLabel(operation: HeaderModOperation) {
  return match(operation)
    .with("set", () => t("headerMod.operation.set"))
    .with("append", () => t("headerMod.operation.append"))
    .with("remove", () => t("headerMod.operation.remove"))
    .exhaustive();
}
</script>

<template>
  <div
    class="
      flex flex-1 flex-col items-end justify-between gap-1
      sm:flex-row sm:items-center
    "
  >
    <div class="flex w-full flex-1">
      <slot name="field-before" />
      <div
        class="
          grid flex-1 flex-col gap-1
          sm:grid-cols-2 sm:grid-rows-1
        "
      >
        <Combobox
          :model-value="field.name"
          :class="cn('flex-1', field.operation === 'remove' && `col-span-2`)"
          @update:model-value="selectAutocompleteOption"
        >
          <ComboboxAnchor class="w-full">
            <ComboboxInput
              v-model="field.name"
              :placeholder="t('common.name')"
              class="
                w-full text-base
                placeholder:italic
              "
              @change="commitHeaderName"
            />
          </ComboboxAnchor>

          <ComboboxList v-if="autocompleteList.length > 0">
            <ComboboxViewport>
              <ComboboxItem
                v-for="option in autocompleteList"
                :key="option"
                :value="option"
                @pointerdown="startSelectingAutocompleteOption"
              >
                {{ option }}
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxList>
        </Combobox>
        <div v-if="field.operation !== 'remove'" class="flex-1">
          <Input
            v-model.trim.lazy="field.value"
            type="text"
            :placeholder="t('common.value')"
            class="
              text-base
              placeholder:italic
            "
          />
        </div>
      </div>
    </div>
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
            <p>{{ t("headerMod.currentOperation", { operation: getOperationLabel(field.operation) }) }}</p>
            <p>{{ t("headerMod.switchTo", { operation: nextOperation.label }) }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        size="icon-xs"
        variant="secondary"
        @click="() => {
          list.splice(index, 1);
        }"
      >
        <span class="sr-only">{{ t("common.deleteHeaderMod") }}</span>
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
