<script setup lang="ts">
import type { GroupItem, GroupType } from "@/lib/type";
import { head } from "es-toolkit";
import { computed } from "vue";
import Fieldset from "./Fieldset.vue";

const { name, type } = defineProps<{
  name: string;
  type?: GroupType;
}>();

const list = defineModel<GroupItem[]>("list", {
  required: true,
});

const indeterminate = computed(() => {
  if (type === "checkbox") {
    return list.value.some(item => item.enabled) && !list.value.every(item => item.enabled);
  }
  return false;
});

const checked = computed(() => {
  if (type === "checkbox") {
    return list.value.every(item => item.enabled);
  }
  return list.value.some(item => item.enabled);
});
</script>

<template>
  <Fieldset
    v-if="list.length"
    v-auto-animate
    :name
  >
    <template #name-before>
      <label v-if="type">
        <Checkbox
          :model-value="checked"
          :indeterminate
          :binary="true"
          @update:model-value="(checked: boolean) => {
            if (type === 'checkbox'){
              list.forEach(item => {
                item.enabled = checked;
              });
            } else if (checked){
              const firstItem = head(list);
              if (firstItem) firstItem.enabled = checked;
            } else {
              list.forEach(item => {
                item.enabled = false;
              });
            }
          }"
        />
      </label>
    </template>
    <template #name-after>
      <slot name="name-after" />
    </template>
    <template #main>
      <div
        v-auto-animate
        class="flex flex-col gap-1"
      >
        <div
          v-for="item, index in list"
          :key="item.id"
        >
          <div class="flex flex-1 items-center justify-between gap-1">
            <Checkbox
              v-if="type === 'checkbox'"
              v-model="item.enabled"
              :binary="true"
              class="me-2"
            />
            <RadioButton
              v-else
              v-model="item.enabled"
              :value="true"
              class="me-2"
              @click="() => {
                list.forEach(m => {
                  if (m.id === item.id) {
                    m.enabled = true;
                    return;
                  }
                  m.enabled = false;
                });
              }"
            />
            <div class="flex flex-1 items-center">
              <slot :index="index" name="item" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </Fieldset>
</template>
