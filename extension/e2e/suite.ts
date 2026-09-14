import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { ExtensionSession, startGuideServer } from "./extension-fixture";

export function setupExtensionSuite() {
  const state = {
    extension: new ExtensionSession(),
    server: undefined as unknown as Awaited<ReturnType<typeof startGuideServer>>,
  };

  beforeAll(async () => {
    state.server = await startGuideServer();
  });

  // A new browser profile isolates cookies, storage, routes, permissions and
  // pending popup writes, including when the preceding test failed midway.
  beforeEach(async () => {
    state.extension = new ExtensionSession();
    await state.extension.start();
  });

  afterEach(async ({ task }) => {
    try {
      if (task.result?.state === "fail" && state.extension.context) {
        const directory = resolve("test-results", task.id);
        await mkdir(directory, { recursive: true });
        await writeFile(resolve(directory, "test.json"), JSON.stringify({ file: task.file.filepath, name: task.name }, null, 2));
        await state.extension.context.tracing.stop({ path: resolve(directory, "trace.zip") });
      }
    } finally {
      await state.extension.close();
    }
  });

  afterAll(async () => {
    await state.server?.close();
  });

  return state;
}
