import { defineExtensionMessaging } from "@webext-core/messaging";

export interface UpdateProfileErrorMessageOptions {
  upsertRecord?: Record<string, string>;
  deleteIds?: string[];
}

export interface UpdateProfileRelatedRuleIdOptions {
  upsertRecord?: Record<string, number>;
  deleteIds?: string[];
}

interface ProtocolMap {
  updateProfileErrorMessage: (options: UpdateProfileErrorMessageOptions) => void;
  updateProfileRelatedRuleId: (options: UpdateProfileRelatedRuleIdOptions) => void;
  unregisterAllRules: () => void;
  reinitializeAllRules: () => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
