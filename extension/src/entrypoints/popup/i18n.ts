import type enUS from "@/locales/en.json";
import { nextTick } from "vue";
import { createI18n } from "vue-i18n";

export const SUPPORT_LOCALES = ["en", "zh·"] as const;
type MessageSchema = typeof enUS;

export function setupI18n() {
  const i18n = createI18n<[MessageSchema], typeof SUPPORT_LOCALES[number]>({
    locale: "en",
    fallbackLocale: "en",
  });
  loadLocaleMessages(i18n, "en");
  setI18nLanguage(i18n, "en");
  return i18n;
}

export function setI18nLanguage(i18n: ReturnType<typeof setupI18n>, locale: typeof SUPPORT_LOCALES[number]) {
  i18n.global.locale.value = locale;
  document.querySelector("html")?.setAttribute("lang", locale);
}

export async function loadLocaleMessages(i18n: ReturnType<typeof setupI18n>, locale: typeof SUPPORT_LOCALES[number]) {
  // load locale messages with dynamic import
  const messages = await import(
    `../../locales/${locale}.json`
  );

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default);

  return nextTick();
}
