import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import Aura from "@primeuix/themes/aura";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";

import App from "./App.vue";
import { router } from "./router";
import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";

createApp(App)
  .use(router)
  .use(createPinia())
  .use(autoAnimatePlugin)
  .use(VueQueryPlugin, {
    enableDevtoolsV6Plugin: true,
  })
  .use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: `[data-theme="dark"]`,
        cssLayer: {
          name: "primevue",
          order: "theme, base, primevue",
        },
      },
    },
  })
  .mount("#app");
