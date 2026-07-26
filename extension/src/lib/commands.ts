import { getObjectKeysWithTypeAssert } from "./object";

export const extensionCommands = {
  "toggle-extension": {
    description: "__MSG_toggleExtensionCommandDescription__",
  },
} as const;

export const extensionCommandIds = getObjectKeysWithTypeAssert(extensionCommands);
export type ExtensionCommandId = (typeof extensionCommandIds)[number];
