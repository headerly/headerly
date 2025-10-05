<script setup lang="ts">
import { useSettingsStore } from "#/stores/useSettingsStore";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import { settings } from "./fields";

const settingsStore = useSettingsStore();
</script>

<template>
  <div
    class="
      grid size-full grid-cols-[3rem_minmax(0,1fr)]
      grid-rows-[3rem_minmax(0,1fr)]
    "
  >
    <Header class="col-start-2 row-start-1" />
    <Sidebar class="col-start-1 row-span-2" />
    <main
      class="
        col-start-2 row-start-2 overflow-x-hidden overflow-y-auto p-2
        text-base-content
      "
    >
      <fieldset
        v-for="setting in settings"
        :id="setting.anchor"
        :key="setting.fieldsetTitle"
        class="
          fieldset gap-y-4 rounded-box border border-base-300 bg-base-200 p-4
          text-base
        "
      >
        <legend class="fieldset-legend text-base font-medium">
          {{ setting.fieldsetTitle }}
        </legend>

        <template v-for="field in setting.fields" :key="field.label">
          <label
            v-if="field.type === 'select'"
            class="label flex flex-col items-start text-base-content"
          >
            {{ field.label }}:
            <select
              v-model="settingsStore[field.key]"
              class="select cursor-pointer"
              @change="field.onChange"
            >
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label
            v-else-if="field.type === 'checkbox'"
            class="label text-base-content"
          >
            <input
              v-model="settingsStore[field.key]"
              type="checkbox"
              class="checkbox"
              @change="field.onChange"
            >
            {{ field.label }}
          </label>
        </template>
      </fieldset>
    </main>
  </div>
</template>
