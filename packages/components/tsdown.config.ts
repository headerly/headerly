import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
  },
  fromVite: true,
  platform: "neutral",
  format: ["esm"],
  dts: { vue: true, sourcemap: true },
  sourcemap: true,
  debug: true,
});
