import type { RuleActionType } from "@/lib/schema";
import { match } from "ts-pattern";
import { useI18n } from "vue-i18n";

export function useRuleActionType() {
  const { t } = useI18n();

  function getRuleActionTypeLabel(type: RuleActionType) {
    return match(type)
      .with("modifyHeaders", () => t("ruleAction.modifyHeaders"))
      .with("block", () => t("ruleAction.block"))
      .with("allow", () => t("ruleAction.allow"))
      .with("upgradeScheme", () => t("ruleAction.upgradeScheme"))
      .with("allowAllRequests", () => t("ruleAction.allowAllRequests"))
      .with("redirect", () => t("ruleAction.redirect"))
      .exhaustive();
  }

  function getRuleActionTypeIcon(type: RuleActionType) {
    const iconMap = {
      modifyHeaders: "i-lucide-zap",
      block: "i-lucide-ban",
      allow: "i-lucide-shield-check",
      upgradeScheme: "i-lucide-lock",
      allowAllRequests: "i-lucide-shield",
      redirect: "i-lucide-corner-right-down",
    } as const;
    return iconMap[type];
  }

  return {
    getRuleActionTypeIcon,
    getRuleActionTypeLabel,
  };
}
