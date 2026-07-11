import type { EventBusKey } from "@vueuse/core";
import type { AddRuleOptionDialogTabValue } from "./shared";

export const openAddRuleOptionDialogKey: EventBusKey<{ target: AddRuleOptionDialogTabValue }> = Symbol("open-add-rule-option-dialog");
