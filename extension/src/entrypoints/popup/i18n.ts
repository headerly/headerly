import type enUS from "@/locales/en.json";
import { nextTick } from "vue";
import { createI18n } from "vue-i18n";

export const SUPPORT_LOCALES = ["en", "zh-CN"] as const;
export type SupportLocale = typeof SUPPORT_LOCALES[number];
type MessageSchema = typeof enUS;

const i18n = createI18n<[MessageSchema], SupportLocale>({
  locale: "en",
  fallbackLocale: "en",
});

export function setupI18n() {
  setI18nLanguage("en");
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
