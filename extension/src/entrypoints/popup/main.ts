import { createApp } from "vue";
import App from "./App.vue";

import type { vAutoAnimate } from "@formkit/auto-animate/vue";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { router } from "./router";

import "@fontsource-variable/inter/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";


declare module "vue" {
  export interface GlobalDirectives {
    // prefix with v
    vAutoAnimate: typeof vAutoAnimate;
  }
}


createApp(App)
  .use(router)
  .use(createPinia())
  .use(autoAnimatePlugin)
  .use(VueQueryPlugin, {
    enableDevtoolsV6Plugin: true,
  })
  .mount("#app");
