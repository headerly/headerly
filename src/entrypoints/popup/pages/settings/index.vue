<script setup lang="ts">
import { categories } from "#/constants/emoji";
import { useSettingsStore } from "#/stores/useSettingsStore";

const settingsStore = useSettingsStore();

interface BaseSettingField {
  label: string;
  key: keyof typeof settingsStore;
}

interface SelectField extends BaseSettingField {
  options: readonly { label: string; value: string }[];
  type: "select";
  onChange?: (e: Event) => void;
}

interface CheckboxField extends BaseSettingField {
  type: "checkbox";
  onChange?: (e: Event) => void;
}

type SettingField = SelectField | CheckboxField;

interface SettingGroup {
  fieldsetTitle: string;
  fields: readonly SettingField[];
}

const settings: SettingGroup[] = [
  {
    fieldsetTitle: "Appearance",
    fields: [
      {
        type: "select",
        label: "Theme",
        options: [
          { label: "Auto", value: "auto" },
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
        ],
        key: "theme",
        onChange(e) {
          const value = (e.target as HTMLSelectElement).value;
          if (value === "auto") {
            document.documentElement.removeAttribute("data-theme");
            return;
          }
          document.documentElement.setAttribute("data-theme", value);
        },
      },
      {
        type: "select",
        label: "Language",
        options: [
          { label: "English", value: "en-US" },
          { label: "Simplified Chinese", value: "zh-CN" },
          { label: "Japanese", value: "ja" },
        ],
        key: "language",
      },
      {
        type: "checkbox",
        label: "Automatically assign emoji to new profiles",
        key: "autoAssignEmoji",
      },
      {
        type: "select",
        label: "Category for random emoji assignment",
        options: categories,
        key: "randomEmojiCategory",
      },
    ],
  },
] as const;
</script>

<template>
  <div
    class="grid size-full grid-rows-[3rem_minmax(0,1fr)]"
  >
    <header
      class="
        col-start-1 row-start-1 flex items-center justify-between border-b
        border-base-content/10 bg-base-200 px-2
      "
    >
      <div class="flex items-center gap-2">
        <RouterLink to="/profiles" class="btn btn-square btn-soft btn-sm">
          <i class="i-lucide-arrow-left size-4" />
          <span class="sr-only">Back to Profiles</span>
        </RouterLink>
        <h1 class="flex items-center gap-2 font-brand text-lg">
          <i class="i-lucide-settings size-5" />
          Settings
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-soft btn-sm btn-error">
          <i class="i-lucide-refresh-cw size-4" />
          Reset
        </button>
      </div>
    </header>

    <main
      class="
        col-start-1 row-start-2 overflow-x-hidden overflow-y-auto p-2
        text-base-content
      "
    >
      <fieldset
        v-for="setting in settings"
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
              class="select"
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
