import type { UUID } from "node:crypto";
import { defineExtensionMessaging } from "@webext-core/messaging";

export interface UpdateProfileErrorMessageOptions {
  upsertRecord?: Record<UUID, string>;
  deleteIds?: UUID[];
}

export interface UpdateProfileRelatedRuleIdOptions {
  upsertRecord?: Record<UUID, number>;
  deleteIds?: UUID[];
}

interface ProtocolMap {
  updateProfileErrorMessage: (options: UpdateProfileErrorMessageOptions) => void;
  updateProfileRelatedRuleId: (options: UpdateProfileRelatedRuleIdOptions) => void;
  unregisterAllRules: () => void;
  reinitializeAllRules: () => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
