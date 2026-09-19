import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    env: {
      HEADERLY_EXTENSION_PATH: resolve(
        import.meta.dirname,
        mode === "development" ? ".output/chrome-mv3-dev" : ".output/chrome-mv3",
      ),
    },
    expect: {
      poll: { interval: 50, timeout: 5000 },
    },
    fileParallelism: false,
    hookTimeout: 45_000,
    include: ["e2e/**/*.e2e.test.ts"],
    maxWorkers: 1,
    testTimeout: 45_000,
  },
}));
