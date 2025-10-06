import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { useThemeStorage } from "@/lib/storage";
import App from "./App.vue";
import { router } from "./router";
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/montserrat/wght-italic.css";
import "@fontsource-variable/intel-one-mono";
import "@/assets/tailwind.css";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(autoAnimatePlugin);
app.use(router);

const { item } = useThemeStorage();
const theme = await item.getValue();
if (theme === "auto") {
  document.documentElement.removeAttribute("data-theme");
} else {
  // TODO: Remove `!` after PR merge
  // https://github.com/wxt-dev/wxt/pull/1909
  document.documentElement.setAttribute("data-theme", theme!);
}
// Don't trigger transitions on initial navigation.
// https://router.vuejs.org/guide/advanced/transitions#Initial-navigation-and-transitions
await router.isReady();
app.mount("#app");
