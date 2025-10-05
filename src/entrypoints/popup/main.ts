import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/montserrat/wght-italic.css";
import "@fontsource-variable/intel-one-mono";
import "@fontsource/belanosima/400.css";
import "@/assets/tailwind.css";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(autoAnimatePlugin);
app.use(router);
app.mount("#app");
