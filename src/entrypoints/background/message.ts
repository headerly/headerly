import type { UUID } from "node:crypto";
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  updateProfileErrorMessage: (errorMap: Record<UUID, string>) => void;
  updateProfileRelatedRuleId: (profileId2RuleIdMap: Record<UUID, number>) => void;
  unregisterAllRules: () => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
