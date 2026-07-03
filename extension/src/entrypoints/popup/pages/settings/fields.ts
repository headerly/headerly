import type { BasicColorSchema } from "@vueuse/core";
import type { SupportLocale } from "#/i18n";
import type { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { setI18nLanguage, SUPPORT_LOCALES } from "#/i18n";

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

export function useCreateSettings() {
  const { t } = useI18n();

  // This needs computed because t() depends on the reactive locale; otherwise the UI will not update when the language changes.
  return computed(() => [
    {
      fieldsetTitle: t("settings.groups.appearance"),
      anchor: "appearance",
      anchorIcon: "i-lucide-aperture",
      fields: [
        {
          type: "select",
          label: t("settings.fields.language"),
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
          label: t("settings.fields.theme"),
          options: [
            { label: t("common.auto"), value: "auto" },
            { label: t("common.light"), value: "light" },
            { label: t("common.dark"), value: "dark" },
          ] satisfies { label: string; value: BasicColorSchema }[],
          key: "theme",
        },
      ],
    },
    {
      fieldsetTitle: t("settings.groups.profiles"),
      anchor: "profiles",
      anchorIcon: "i-lucide-code-xml",
      fields: [
        {
          type: "checkbox",
          label: t("settings.fields.nativeResourceTypeBehavior"),
          key: "nativeResourceTypeBehavior",
          description: t("settings.descriptions.nativeResourceTypeBehavior"),
        },
      ],
    },
  ] satisfies SettingGroup[]);
}
