import type { UUID } from "node:crypto";
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  /**
   *
   * @returns Indicates whether the popup has received the message.
   */
  generateProfileId2ErrorMap: (errorMap: Record<UUID, string>) => boolean;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
