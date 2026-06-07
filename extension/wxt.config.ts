import type { WxtViteConfig } from "wxt";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import turboConsole from "unplugin-turbo-console/vite";
import vueDevtools from "vite-plugin-vue-devtools";
import vueRouter from "vue-router/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    // The public _locales files only let Chrome Web Store detect supported languages.
    // Runtime UI translations are handled by vue-i18n.
    default_locale: "en",
    description: "__MSG_extensionDescription__",
    name: "__MSG_extensionName__",
    homepage_url: "https://github.com/headerly/headerly",
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
