import { afterAll, beforeAll } from "vitest";
import { ExtensionSession, startGuideServer } from "./extension-fixture";

export function setupExtensionSuite() {
  const state = {
    extension: new ExtensionSession(),
    server: undefined as unknown as Awaited<ReturnType<typeof startGuideServer>>,
  };

  beforeAll(async () => {
    state.server = await startGuideServer();
    await state.extension.start();
  });

  afterAll(async () => {
    await state.extension.close();
    await state.server.close();
  });

  return state;
}
