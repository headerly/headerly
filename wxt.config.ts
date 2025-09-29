import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import turboConsole from "unplugin-turbo-console/vite";
import { analyzer } from "vite-bundle-analyzer";
import vueDevtools from "vite-plugin-vue-devtools";

import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: [
      "storage",
      "unlimitedStorage",
      "declarativeNetRequest",
      "declarativeNetRequestFeedback",
    ],
    homepage_url: "https://headerly.dev",
  },
  webExt: {
    disabled: true,
  },
  srcDir: "src",
  // modules: ["@wxt-dev/auto-icons"],
  // autoIcons: {
  //   baseIconPath: "assets/Logo.svg",
  // },
  zip: {
    name: "headerly",
  },
  vite: () => ({
    plugins: [
      vueDevtools({
        appendTo: "src/entrypoints/popup/main.ts",
      }),
      vue(),
      tailwindcss(),
      turboConsole(),
      analyzer({
        enabled: false,
      }),
    ],
    build: {
      target: "esnext",
    },
  }),
});
