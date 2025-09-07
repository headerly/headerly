import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
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
  hooks: {
    // https://github.com/wxt-dev/wxt/issues/533
    "vite:devServer:extendConfig": (config) => {
      config.plugins?.push(vueDevtools({
        appendTo: "src/entrypoints/options/main.ts",
      }));
    },
  },
  vite: () => ({
    plugins: [
      vueDevtools({
        appendTo: "src/entrypoints/popup/main.ts",
      }),
      vue(),
      tailwindcss(),
    ],
    build: {
      target: "esnext",
    },
  }),
});
