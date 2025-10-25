import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["vitest-browser-vue", "./vitest.setup.ts"],
    css: true,
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          slowMo: 100,
        },
      }),
      instances: [
        { browser: "chromium" },
      ],
    },
  },
  plugins: [vue(), vueJsx(), tailwindcss()],
  resolve: {
    alias: {
      "#": resolve("src/entrypoints/popup"),
      "##": resolve("src/entrypoints"),
    },
  },
});
