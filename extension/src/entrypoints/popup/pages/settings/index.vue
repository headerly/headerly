<script setup lang="tsx">
import Fieldset from "#/components/group/Fieldset.vue";
import Select from "#/components/select/Select.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import { settings } from "./fields";

const settingsStore = useSettingsStore();

function InfoTooltip({ description }: { description: string }) {
  return (
    <TooltipProvider delay-duration={200}>
      <Tooltip>
        <TooltipTrigger as-child>
          <button class="btn ms-1 btn-square btn-ghost btn-xs btn-info">
            <i class="i-lucide-circle-question-mark size-4 cursor-pointer" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" class="w-80">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
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
        text-base-content col-start-2 row-start-2 overflow-x-hidden
        overflow-y-auto px-2 pb-2
      "
    >
      <Fieldset
        v-for="setting in settings"
        :key="setting.fieldsetTitle"
        :name="setting.fieldsetTitle"
        class="
          fieldset rounded-box border-base-300 bg-base-200 gap-y-4 border p-4
          text-base
        "
      >
        <template #main>
          <div class="flex size-full flex-col gap-2">
            <template v-for="field in setting.fields" :key="field.label">
              <div
                v-if="field.type === 'select'"
              >
                <label
                  class="
                    label text-base-content flex flex-col items-start
                    whitespace-normal
                  "
                >
                  {{ field.label }}:
                  <div class="flex items-center">
                    <!-- @vue-expect-error The type of `settingsStore[field.key]`
                     was miscalculated as `never`, I don’t know how to solve this issue -->
                    <Select
                      v-model="settingsStore[field.key]"
                      class="min-w-60"
                      :options="field.options"
                    />
                    <InfoTooltip
                      v-if="'description' in field && field.description"
                      :description="field.description"
                    />
                  </div>
                </label>
              </div>
              <div
                v-else-if="field.type === 'checkbox'"
                class="flex items-center"
              >
                <label
                  class="label text-base-content items-start whitespace-normal"
                >
                  <input
                    v-model="settingsStore[field.key]"
                    type="checkbox"
                    class="checkbox"
                  >
                  {{ field.label }}
                </label>
                <InfoTooltip
                  v-if="'description' in field && field.description"
                  :description="field.description"
                />
              </div>
            </template>
          </div>
        </template>
      </Fieldset>
    </main>
  </div>
</template>
