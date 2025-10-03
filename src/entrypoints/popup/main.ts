import { autoAnimatePlugin } from "@formkit/auto-animate/vue";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { useProfilesStore } from "./stores/useProfilesStore";
import "@/assets/tailwind.css";
import "@fontsource-variable/montserrat/wght-italic.css";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(autoAnimatePlugin);
const profileManagerStorage = useProfilesStore();
// Preventing FOUC
await profileManagerStorage.ready;
app.mount("#app");
