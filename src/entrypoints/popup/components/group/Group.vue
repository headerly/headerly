<script setup lang="ts">
import type { UUID } from "node:crypto";
import type { ModGroupType } from "@/lib/storage";
import { head } from "es-toolkit";
import { computed } from "vue";
import Fieldset from "./Fieldset.vue";

const { name, type } = defineProps<{
  name: string;
  type?: ModGroupType;
}>();

const list = defineModel<{
  id: UUID;
  enabled: boolean;
}[]>({
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
    v-auto-animate
    :name
  >
    <template #name-before>
      <label v-if="type">
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          :checked
          :indeterminate
          @change="(e) => {
            const checked = (e.target as HTMLInputElement).checked;
            if (type === 'checkbox'){
              list.forEach(item => {
                item.enabled = checked;
              });
            }
            else if (checked){
              const firstItem = head(list);
              if (firstItem) firstItem.enabled = checked;
            }
            else {
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
        v-for="item, index in list"
        :key="item.id"
        class="flex flex-col gap-1.5"
      >
        <div class="flex flex-1 items-center justify-between gap-1">
          <input
            v-if="type === 'checkbox'"
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
          <slot :id="item.id" name="item" :index="index" />
        </div>
      </div>
    </template>
  </Fieldset>
</template>
