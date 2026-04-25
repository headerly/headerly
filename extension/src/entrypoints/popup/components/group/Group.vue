<script setup lang="ts" generic="T extends GroupItem">
import type { GroupItem, GroupType } from "@/lib/schema";
import { Checkbox } from "#/ui/checkbox";
import { Label } from "#/ui/label";
import { RadioGroup, RadioGroupItem } from "#/ui/radio-group";
import { head } from "es-toolkit";
import { match, P } from "ts-pattern";
import { computed, useTemplateRef, watch } from "vue";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";
import Fieldset from "./Fieldset.vue";
import SortableItem from "./SortableItem.vue";

const list = defineModel<T[]>("list", {
  required: true,
});

const { name, type } = defineProps<{
  name: string;
  type?: GroupType;
}>();

const emit = defineEmits<{
  (e: "deleteEmptyGroup"): void;
}>();

watch(() => list.value.length, (newLength) => {
  if (newLength === 0) {
    emit("deleteEmptyGroup");
  }
});

const checkedState = computed(() => {
  const enabledCount = list.value.filter(item => item.enabled).length;
  const groupStatus = match(enabledCount)
    .with(0, () => "none" as const)
    .with(list.value.length, () => "all" as const)
    .otherwise(() => "some" as const);

  const result = match([type, groupStatus])
    .with(["checkbox", "none"], () => false)
    .with(["checkbox", "all"], () => true)
    .with(["checkbox", "some"], () => "indeterminate" as const)
    .with(["radio", P.not("none")], () => true)
    .otherwise(() => false);
  return result;
});

const listContainer = useTemplateRef<HTMLElement>("listContainer");

useSortableAndAutoAnimate({
  listContainer,
  list: list.value,
  handle: "[data-sort-handle]",
});
</script>

<template>
  <Fieldset
    v-if="list.length"
    v-auto-animate
    :name
  >
    <template #name-before>
      <Label v-if="type">
        <Checkbox
          :model-value="checkedState"
          @update:model-value="(val) => {
            const isChecked = val === true;
            if (type === 'checkbox'){
              list.forEach(item => {
                item.enabled = isChecked;
              });
            } else if (isChecked){
              const firstItem = head(list);
              if (firstItem) firstItem.enabled = true;
            } else {
              list.forEach(item => {
                item.enabled = false;
              });
            }
          }"
        />
      </Label>
    </template>
    <template #name-after>
      <slot name="name-after" />
    </template>
    <template #main>
      <component
        :is="type === 'radio' ? RadioGroup : 'div'"
        v-bind="type === 'radio'
          ? {
            'as': 'div',
            'modelValue': list.find(item => item.enabled)?.id,
            'onUpdate:modelValue': (val: string) => {
              list.forEach(item => {
                item.enabled = item.id === val;
              });
            },
          }
          : {}"
      >
        <div
          ref="listContainer"
          class="flex flex-col gap-1"
        >
          <div
            v-for="item, index in list"
            :key="item.id"
          >
            <SortableItem>
              <Checkbox
                v-if="type === 'checkbox'"
                :model-value="item.enabled"
                class="mr-1"
                @update:model-value="(val) => item.enabled = val === true"
              />
              <RadioGroupItem
                v-else
                :value="item.id"
                class="mr-1"
              />
              <div class="flex flex-1 items-center">
                <slot :index name="item" />
              </div>
            </SortableItem>
          </div>
        </div>
      </component>
    </template>
  </Fieldset>
</template>
