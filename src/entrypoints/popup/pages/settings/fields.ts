import type { useSettingsStore } from "#/stores/useSettingsStore";
import { categories } from "#/constants/emoji";
import { setTheme } from "#/theme";
import { getModKey } from "@/lib/utils";

interface BaseSettingField {
  label: string;
  key: keyof ReturnType<typeof useSettingsStore>;
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
  anchor: string;
  anchorIcon: string;
}

export const settings: SettingGroup[] = [
  {
    fieldsetTitle: "Appearance",
    anchor: "appearance",
    anchorIcon: "i-lucide-aperture",
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
        onChange: setTheme,
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
        label: `Enable ${getModKey()} + 1-9 shortcut to switch profiles`,
        key: "enableProfileShortcut",
      },
    ],
  },
  {
    fieldsetTitle: "Emoji",
    anchor: "emoji",
    anchorIcon: "i-lucide-smile",
    fields: [
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
];
