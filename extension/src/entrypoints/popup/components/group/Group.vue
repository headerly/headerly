<script setup lang="ts" generic="T extends GroupItem">
import type { GroupItem, GroupType } from "@/lib/schema";
import { Checkbox } from "#/ui/checkbox";
import { Label } from "#/ui/label";
import { RadioGroup, RadioGroupItem } from "#/ui/radio-group";
import { head } from "es-toolkit";
import { match, P } from "ts-pattern";
import { computed } from "vue";
import Fieldset from "./Fieldset.vue";

const list = defineModel<T[]>("list", {
  required: true,
});

const { name, type } = defineProps<{
  name: string;
  type?: GroupType;
}>();

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
      <div
        v-auto-animate
        class="flex flex-col gap-1.5"
      >
        <template v-if="type !== 'radio'">
          <div
            v-for="item, index in list"
            :key="item.id"
          >
            <div class="flex flex-1 items-center justify-between gap-1">
              <Checkbox
                v-if="type === 'checkbox'"
                :model-value="item.enabled"
                class="mr-1"
                @update:model-value="(val) => item.enabled = val === true"
              />
              <div class="flex flex-1 items-center">
                <slot :index name="item" />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <RadioGroup
            class="flex flex-col gap-1"
            :model-value="list.find(item => item.enabled)?.id"
            @update:model-value="(val) => {
              list.forEach(item => {
                item.enabled = item.id === val;
              });
            }"
          >
            <div
              v-for="item, index in list"
              :key="item.id"
            >
              <div class="flex flex-1 items-center justify-between gap-1">
                <RadioGroupItem
                  :value="item.id"
                  class="mr-1"
                />
                <div class="flex flex-1 items-center">
                  <slot :index name="item" />
                </div>
              </div>
            </div>
          </RadioGroup>
        </template>
      </div>
    </template>
  </Fieldset>
</template>
