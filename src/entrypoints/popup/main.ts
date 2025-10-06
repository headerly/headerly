import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { setTheme } from "./theme";
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/montserrat/wght-italic.css";
import "@fontsource-variable/intel-one-mono";
import "@/assets/tailwind.css";

setTheme();
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(autoAnimatePlugin);
app.use(router);
app.mount("#app");
