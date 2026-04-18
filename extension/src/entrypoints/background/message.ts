import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  reinitializeAllRules: () => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
