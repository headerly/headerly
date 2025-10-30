<script setup lang="ts">
import type { GroupItem, GroupType } from "@/lib/storage";
import { head } from "es-toolkit";
import { computed } from "vue";
import Fieldset from "./Fieldset.vue";

const { name, type: propType } = defineProps<{
  name: string;
  type?: GroupType;
}>();

const list = defineModel<GroupItem[]>("list", {
  required: true,
});

const modelType = defineModel<GroupType>("type");

const type = computed(() => propType ?? modelType.value);

const indeterminate = computed(() => {
  if (type.value === "checkbox") {
    return list.value.some(item => item.enabled) && !list.value.every(item => item.enabled);
  }
  return false;
});

const checked = computed(() => {
  if (type.value === "checkbox") {
    return list.value.every(item => item.enabled);
  }
  return list.value.some(item => item.enabled);
});
</script>

<template>
  <Fieldset
    v-auto-animate
    :name
  >
    <template #name-before>
      <label v-if="modelType">
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          :checked
          :indeterminate
          @change="(e) => {
            const checked = (e.target as HTMLInputElement).checked;
            if (modelType === 'checkbox'){
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
        >
      </label>
    </template>
    <template #name-after>
      <slot name="name-after" />
    </template>
    <template #main>
      <div
        v-auto-animate
        class="flex flex-col gap-1.5"
      >
        <div
          v-for="item, index in list"
          :key="item.id"
        >
          <div class="flex flex-1 items-center justify-between gap-1">
            <input
              v-if="modelType === 'checkbox'"
              v-model="item.enabled"
              type="checkbox"
              class="checkbox mr-1 checkbox-sm"
            >
            <input
              v-else
              v-model="item.enabled"
              type="checkbox"
              class="radio mr-1 size-5"
              @click="() => {
                list.forEach(m => {
                  if (m.id === item.id) {
                    m.enabled = true;
                    return;
                  }
                  m.enabled = false;
                });
              }"
            >
            <div class="flex flex-1 items-center">
              <slot :index="index" name="item" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </Fieldset>
</template>
