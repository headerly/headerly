import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import "~console/theme-detect";

import "@/assets/tailwind.css";
import "@fontsource-variable/montserrat/wght-italic.css";

const pinia = createPinia();
createApp(App)
  .use(pinia)
  .mount("#app");
