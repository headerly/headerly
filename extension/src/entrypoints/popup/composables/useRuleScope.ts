import type { RuleType } from "@/lib/schema";
import { useI18n } from "vue-i18n";

export function useRuleScope() {
  const { t } = useI18n();

  return {
    dynamic: {
      icon: "i-lucide-database",
      get label() {
        return t("ruleScope.dynamic");
      },
    },
    session: {
      icon: "i-lucide-timer-reset",
      get label() {
        return t("ruleScope.session");
      },
    },
  } satisfies Record<RuleType, { icon: string; label: string }>;
}
