import type { AddRuleOptionDialogTab } from "./shared";
import { useCreateActionTab } from "./actions";
import { useCreateConditionTab } from "./conditions";

export function useCreateTabs(): AddRuleOptionDialogTab[] {
  return [useCreateActionTab(), useCreateConditionTab()];
}
