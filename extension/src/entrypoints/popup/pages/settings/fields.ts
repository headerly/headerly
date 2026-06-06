import type { BasicColorSchema } from "@vueuse/core";
import type { SupportLocale } from "#/i18n";
import type { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { setI18nLanguage, SUPPORT_LOCALES } from "#/i18n";
import { categories } from "@/entrypoints/popup/constants/emoji";

interface BaseSettingField {
  labelKey: string;
  key: keyof ReturnType<typeof useSettingsStore>;
  descriptionKey?: string;
}

interface SelectField extends BaseSettingField {
  options: readonly ({ label: string; value: string } | { labelKey: string; value: string })[];
  type: "select";
  onChange?: (v: string) => void;
}

interface CheckboxField extends BaseSettingField {
  type: "checkbox";
  onChange?: (e: Event) => void;
}

type SettingField = SelectField | CheckboxField;

interface SettingGroup {
  fieldsetTitleKey: string;
  fields: SettingField[];
  anchor: string;
  anchorIcon: string;
}

export const settings = [
  {
    fieldsetTitleKey: "settings.groups.appearance",
    anchor: "appearance",
    anchorIcon: "i-lucide-aperture",
    fields: [
      {
        type: "select",
        labelKey: "settings.fields.language",
        options: SUPPORT_LOCALES.map(locale => ({
          label: new Intl.DisplayNames(locale, { type: "language" }).of(locale) ?? locale,
          value: locale,
        })),
        key: "language",
        onChange(v) {
          setI18nLanguage(v as SupportLocale);
        },
      },
      {
        type: "select",
        labelKey: "settings.fields.theme",
        options: [
          { labelKey: "common.auto", value: "auto" },
          { labelKey: "common.light", value: "light" },
          { labelKey: "common.dark", value: "dark" },
        ] satisfies { labelKey: string; value: BasicColorSchema }[],
        key: "theme",
      },
      {
        type: "checkbox",
        labelKey: "settings.fields.autoAssignEmoji",
        key: "autoAssignEmoji",
      },
      {
        type: "select",
        labelKey: "settings.fields.randomEmojiCategory",
        options: categories.map(category => ({
          labelKey: `emoji.categories.${category.value}`,
          value: category.value,
        })),
        key: "randomEmojiCategory",
      },
    ],
  },
  {
    fieldsetTitleKey: "settings.groups.profiles",
    anchor: "profiles",
    anchorIcon: "i-lucide-code-xml",
    fields: [
      {
        type: "checkbox",
        labelKey: "settings.fields.nativeResourceTypeBehavior",
        key: "nativeResourceTypeBehavior",
        descriptionKey: "settings.descriptions.nativeResourceTypeBehavior",
      },
    ],
  },
] satisfies SettingGroup[];
