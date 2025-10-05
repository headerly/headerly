import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import turboConsole from "unplugin-turbo-console/vite";
import vueDevtools from "vite-plugin-vue-devtools";

import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Headerly",
    permissions: [
      "storage",
      "unlimitedStorage",
      "declarativeNetRequest",
      "declarativeNetRequestFeedback",
    ],
    host_permissions: [
      "<all_urls>",
    ],
    homepage_url: "https://headerly.dev",
  },
  webExt: {
    disabled: true,
  },
  srcDir: "src",
  zip: {
    name: "headerly",
  },
  modules: ["@wxt-dev/auto-icons"],
  autoIcons: {
    baseIconPath: "assets/logo.svg",
  },
  vite: () => ({
    plugins: [
      vueDevtools({
        appendTo: "src/entrypoints/popup/main.ts",
      }),
      vue(),
      tailwindcss(),
      turboConsole(),
    ],
    build: {
      target: "esnext",
    },
  }),
});
