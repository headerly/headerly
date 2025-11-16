<script setup lang="ts">
import Fieldset from "#/components/group/Fieldset.vue";
import Select from "#/components/select/Select.vue";
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
        col-start-2 row-start-2 overflow-x-hidden overflow-y-auto px-2 pb-2
        text-base-content
      "
    >
      <Fieldset
        v-for="setting in settings"
        :id="setting.anchor"
        :key="setting.fieldsetTitle"
        :name="setting.fieldsetTitle"
        class="
          fieldset gap-y-4 rounded-box border border-base-300 bg-base-200 p-4
          text-base
        "
      >
        <template #main>
          <div class="flex size-full flex-col gap-2">
            <template v-for="field in setting.fields" :key="field.label">
              <label
                v-if="field.type === 'select'"
                class="
                  label flex flex-col items-start whitespace-normal
                  text-base-content
                "
              >
                {{ field.label }}:
                <Select
                  v-model="settingsStore[field.key]"
                  class="min-w-60"
                  :options="field.options"
                  @change="(v) => {
                    field.onChange?.(v);
                  }"
                />
              </label>

              <label
                v-else-if="field.type === 'checkbox'"
                class="label items-start whitespace-normal text-base-content"
              >
                <input
                  v-model="settingsStore[field.key]"
                  type="checkbox"
                  class="checkbox"
                >
                {{ field.label }}
              </label>
            </template>
          </div>
        </template>
      </Fieldset>
    </main>
  </div>
</template>
