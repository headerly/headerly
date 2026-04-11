import type { BasicColorSchema } from "@vueuse/core";
import type { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { categories } from "@/entrypoints/popup/constants/emoji";

interface BaseSettingField {
  label: string;
  key: keyof ReturnType<typeof useSettingsStore>;
  description?: string;
}

interface SelectField extends BaseSettingField {
  options: readonly { label: string; value: string }[];
  type: "select";
  onChange?: (v: string) => void;
}

interface CheckboxField extends BaseSettingField {
  type: "checkbox";
  onChange?: (e: Event) => void;
}

type SettingField = SelectField | CheckboxField;

interface SettingGroup {
  fieldsetTitle: string;
  fields: SettingField[];
  anchor: string;
  anchorIcon: string;
}

export const settings = [
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
        ] satisfies { label: string; value: BasicColorSchema }[],
        key: "theme",
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
  {
    fieldsetTitle: "Profiles",
    anchor: "profiles",
    anchorIcon: "i-lucide-code-xml",
    fields: [
      {
        type: "checkbox",
        label: "Use native DNR resource type behavior",
        key: "nativeResourceTypeBehavior",
        description: "Resource type defaults to 'all', but enabling this option will not set it to 'all', and rules without a resource type condition will match only a narrower range of requests.",
      },
    ],
  },
] satisfies SettingGroup[];
