<script setup lang="tsx">
import {
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from "#/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/ui/popover";
import { LucideCheck, LucideX } from "lucide-vue-next";
import {
  ComboboxInput,
  ComboboxRoot,
  TagsInputInput,
  TagsInputRoot,
  useFilter,
} from "reka-ui";
import { computed, ref, watch } from "vue";
import SelectableTag from "./SelectableTag.vue";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  defaultOptions?: Option[];
  /** manually controlled options */
  options: Option[];
  placeholder?: string;
  hideClearAllButton?: boolean;
}

const query = defineModel<string>("query", {
  default: "",
});

const modelValue = defineModel<string[]>("modelValue", {
  default: () => [],
});

const props = defineProps<MultiSelectProps>();

const { contains } = useFilter({ sensitivity: "base" });

const maxVisibleTags = ref(3);

const filteredOptions = computed(() =>
  props.options.filter(option =>
    contains(option.value, query.value),
  ),
);

// Convert string values to display labels
const selectedItems = computed(() =>
  modelValue.value.map((value) => {
    const option = props.options.find(opt => opt.value === value);
    return {
      value,
      label: option?.label || value,
    };
  }),
);

const visibleItems = computed(() => {
  if (selectedItems.value.length <= maxVisibleTags.value) {
    return {
      visible: selectedItems.value,
      hidden: [],
      hasMore: false,
    };
  }

  return {
    visible: selectedItems.value.slice(0, maxVisibleTags.value),
    hidden: selectedItems.value.slice(maxVisibleTags.value),
    hasMore: true,
  };
});

watch(
  modelValue,
  () => {
    query.value = "";
  },
  { deep: true },
);

function removeTag(index: number) {
  modelValue.value = modelValue.value.filter((_, i) => i !== index);
}

function addOption(option: Option) {
  if (!modelValue.value.includes(option.value)) {
    modelValue.value = [...modelValue.value, option.value];
  }
}

function removeTagByValue(value: string) {
  modelValue.value = modelValue.value.filter(v => v !== value);
}
</script>

<template>
  <ComboboxRoot
    v-model="modelValue"
    open-on-click
    open-on-focus
    multiple
    class="flex flex-1"
  >
    <ComboboxAnchor class="flex-1">
      <TagsInputRoot
        v-model="selectedItems"
        delimiter=""
        class="
          relative h-[36px] cursor-text rounded-md border border-input p-1
          text-sm transition-[color,box-shadow] outline-none
          focus-within:border-ring focus-within:ring-[3px]
          focus-within:ring-ring/50
          has-disabled:pointer-events-none has-disabled:cursor-not-allowed
          has-disabled:opacity-50
          has-aria-invalid:border-destructive
          has-aria-invalid:ring-destructive/20
          dark:has-aria-invalid:ring-destructive/40
        "
        :class="{
          'pe-9': !hideClearAllButton,
        }"
      >
        <div class="flex min-w-0 items-center gap-1">
          <SelectableTag
            v-for="(item, index) in visibleItems.visible"
            :key="item.value"
            :item
            :index
            variant="default"
            @remove-by-index="removeTag"
          />

          <Popover v-if="visibleItems.hasMore">
            <PopoverTrigger as-child>
              <SelectableTag
                :item="{ label: `+${visibleItems.hidden.length}`, value: 'more' }"
                variant="more"
              />
            </PopoverTrigger>
            <PopoverContent class="max-w-80 p-3">
              <div class="space-y-2">
                <div class="flex flex-wrap gap-1">
                  <SelectableTag
                    v-for="item in visibleItems.hidden"
                    :key="item.value"
                    :item
                    variant="compact"
                    @remove="removeTagByValue"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <ComboboxInput v-model="query" as-child>
            <TagsInputInput
              :placeholder="modelValue.length > 0 ? '' : props.placeholder || 'Select options'"
              class="
                min-w-[120px] flex-1 bg-transparent px-2 py-1 outline-hidden
                placeholder:text-muted-foreground/70
                disabled:cursor-not-allowed
              "
              :class="{
                '-ml-1': modelValue.length !== 0,
              }"
            />
          </ComboboxInput>
        </div>
        <button
          v-if="!hideClearAllButton && modelValue.length"
          type="button"
          class="
            absolute end-0 top-0 flex size-9 items-center justify-center
            rounded-md border border-transparent text-muted-foreground/80
            transition-[color,box-shadow] outline-none
            hover:text-foreground
            focus-visible:border-ring focus-visible:ring-[3px]
            focus-visible:ring-ring/50
          "
          aria-label="Clear all"
          @click="() => (modelValue = [])"
        >
          <LucideX class="size-4" aria-hidden="true" />
        </button>
      </TagsInputRoot>
    </ComboboxAnchor>

    <ComboboxList
      class="w-(--reka-combobox-trigger-width)"
    >
      <ComboboxEmpty class="px-2 py-4">
        No results found.
      </ComboboxEmpty>

      <ComboboxGroup
        v-if="filteredOptions.length"
        class="flex max-h-60 flex-col gap-0.5 overflow-y-auto p-1"
      >
        <ComboboxItem
          v-for="option in filteredOptions"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          :class="{
            'bg-accent/50': modelValue.includes(option.value),
          }"
          @click="() => addOption(option)"
        >
          {{ option.label }}

          <ComboboxItemIndicator v-if="modelValue.includes(option.value)">
            <LucideCheck class="ml-auto size-4" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </ComboboxRoot>
</template>
