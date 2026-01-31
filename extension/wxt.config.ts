import type { WxtViteConfig } from "wxt";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import turboConsole from "unplugin-turbo-console/vite";
import vueRouter from "unplugin-vue-router/vite";

import vueDevtools from "vite-plugin-vue-devtools";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    description: "Manage and customize HTTP request & response headers with ease. Quickly set, append, or remove headers.",
    homepage_url: "https://headerly.dev",
    name: "Headerly",
    permissions: [
      "storage",
      "declarativeNetRequest",
    ],
    host_permissions: [
      "<all_urls>",
    ],
    optional_permissions: [
      "cookies",
    ],
    minimum_chrome_version: "140",
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
  alias: {
    "#": resolve("src/entrypoints/popup"),
    "##": resolve("src/entrypoints"),
  },
  hooks: {
    "prepare:types": async (_, entries) => {
      entries.push({
        module: "./typed-router.d.ts",
      }, {
        module: "./vue-components.d.ts",
      });
    },
  },
  vite: () => <WxtViteConfig>({
    plugins: [
      vueDevtools({
        appendTo: "src/entrypoints/popup/main.ts",
      }),
      vue(),
      vueJsx(),
      tailwindcss(),
      turboConsole(),
      vueRouter({
        routesFolder: [{
          src: "./src/entrypoints/popup/pages",
        }],
        // Cannot use `./.wxt/types/typed-router.d.ts` path
        // because the `types` directory does not exist when the plugin executes.
        dts: "./.wxt/typed-router.d.ts",
        exclude: ["**/components/**"],
      }),
    ],
    build: {
      target: "esnext",
    },
  }),
});
