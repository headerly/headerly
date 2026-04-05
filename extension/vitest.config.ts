import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig({
  plugins: [vue(), vueJsx(), tailwindcss(), WxtVitest()],
  resolve: {
    alias: {
      "#": resolve("src/entrypoints/popup"),
      "##": resolve("src/entrypoints"),
    },
  },
});
