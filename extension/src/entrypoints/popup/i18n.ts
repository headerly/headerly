import type enUS from "@/locales/en.json";
import { nextTick } from "vue";
import { createI18n } from "vue-i18n";
import { useLanguageStorage } from "@/lib/storage";

export const SUPPORT_LOCALES = ["en", "zh-CN"] as const;
export type SupportLocale = typeof SUPPORT_LOCALES[number];
type MessageSchema = typeof enUS;

export const i18n = createI18n<[MessageSchema], SupportLocale>({
  locale: "en",
  fallbackLocale: "en",
});

export function setupI18n() {
  const lang = useLanguageStorage().ref.value;
  setI18nLanguage(lang);
  return i18n;
}

export function setI18nLanguage(locale: SupportLocale) {
  i18n.global.locale.value = locale;
  loadLocaleMessages(locale);
  document.documentElement.lang = locale;
}

async function loadLocaleMessages(locale: SupportLocale) {
  // load locale messages with dynamic import
  const messages = await import(
    `../../locales/${locale}.json`
  );

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default);

  return nextTick();
}
