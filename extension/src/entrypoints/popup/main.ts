import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { setupI18n } from "./i18n";
import { router } from "./router";

import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/roboto-mono";
import "./index.css";

createApp(App)
  .use(router)
  .use(setupI18n())
  .use(createPinia())
  .use(autoAnimatePlugin)
  .use(VueQueryPlugin, {
    enableDevtoolsV6Plugin: true,
  })
  .mount("#app");
