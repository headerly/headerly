import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { uiLabelsKey } from "@headerly/ui/lib/labels";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { computed, createApp } from "vue";

import App from "./App.vue";
import { setupI18n } from "./i18n";
import { router } from "./router";

import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/roboto-mono";
import "./index.css";

const i18n = setupI18n();

createApp(App)
  .use(router)
  .use(i18n)
  .provide(uiLabelsKey, computed(() => ({
    close: i18n.global.t("common.close"),
    loading: i18n.global.t("common.loading"),
    selectOptions: i18n.global.t("common.selectOptions"),
    clearAll: i18n.global.t("common.clearAll"),
    noResultsFound: i18n.global.t("common.noResultsFound"),
  })))
  .use(createPinia())
  .use(autoAnimatePlugin)
  .use(VueQueryPlugin, {
    enableDevtoolsV6Plugin: true,
  })
  .mount("#app");
