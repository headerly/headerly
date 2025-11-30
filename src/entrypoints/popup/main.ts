import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";
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
  .mount("#app");
