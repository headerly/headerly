import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      HEADERLY_EXTENSION_PATH: resolve(import.meta.dirname, ".output/chrome-mv3"),
    },
    fileParallelism: false,
    hookTimeout: 45_000,
    include: ["e2e/**/*.e2e.test.ts"],
    maxWorkers: 1,
    testTimeout: 45_000,
  },
});
