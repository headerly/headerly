import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  openSharedProfilesImport: (query: string) => void;
  reinitializeAllRules: () => void;
  reinitializeProfileRule: (profileId: string) => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
