import type { RuleActionType } from "@/lib/schema";
import { useI18n } from "vue-i18n";

export function useRuleActionType() {
  const { t } = useI18n();

  return {
    modifyHeaders: {
      icon: "i-lucide-zap",
      get label() {
        return t("ruleAction.modifyHeaders");
      },
    },
    block: {
      icon: "i-lucide-ban",
      get label() {
        return t("ruleAction.block");
      },
    },
    allow: {
      icon: "i-lucide-shield-check",
      get label() {
        return t("ruleAction.allow");
      },
    },
    upgradeScheme: {
      icon: "i-lucide-lock",
      get label() {
        return t("ruleAction.upgradeScheme");
      },
    },
    allowAllRequests: {
      icon: "i-lucide-shield",
      get label() {
        return t("ruleAction.allowAllRequests");
      },
    },
    redirect: {
      icon: "i-lucide-corner-right-down",
      get label() {
        return t("ruleAction.redirect");
      },
    },
  } satisfies Record<RuleActionType, { icon: string; label: string }>;
}
