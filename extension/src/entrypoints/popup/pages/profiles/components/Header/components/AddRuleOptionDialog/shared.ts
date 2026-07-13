export interface AddRuleOptionDialogItem {
  key: string;
  title: string;
  description: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
  disabledTooltip?: string;
  isRecommended?: boolean;
}

export type AddRuleOptionDialogTabValue = "actions" | "conditions";

export interface AddRuleOptionDialogTab {
  label: string;
  value: AddRuleOptionDialogTabValue;
  items: AddRuleOptionDialogItem[];
}

export interface DisabledState {
  disabled: boolean;
  disabledTooltip?: string;
}

export type DisabledStateGetter = () => DisabledState;

export function withDisabledState<T extends AddRuleOptionDialogItem>(item: T, getState: DisabledStateGetter) {
  return Object.defineProperties(item, {
    disabled: {
      enumerable: true,
      get() {
        return getState().disabled;
      },
    },
    disabledTooltip: {
      enumerable: true,
      get() {
        return getState().disabledTooltip;
      },
    },
  });
}

export function getEnabledState(): DisabledState {
  return { disabled: false };
}
