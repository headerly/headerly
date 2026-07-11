import { match } from "ts-pattern";

export interface AddRuleOptionDialogItem {
  key: string;
  title: string;
  description: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
  disabledTooltip?: string;
  isPopular?: boolean;
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

export async function getCurrentTabHostname() {
  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
  // Try to construct URL object, return null if invalid URL(for example, `chrome://extensions/`)
  try {
    const url = new URL(currentTab?.url ?? "");
    if (!url) {
      return "";
    }
    return match(["https", "http"].includes(url.protocol))
      .with(true, () => url.hostname)
      .with(false, () => "")
      .exhaustive();
  } catch {
    return "";
  }
}

export function getDnrUrlFilterValue(hostname: string) {
  return match(Boolean(hostname))
    .with(true, () => `||${hostname}/*`)
    .with(false, () => "")
    .exhaustive();
}

export function getDnrDomainFilterValue(hostname: string) {
  return match(Boolean(hostname))
    .with(true, () => `||${hostname}/`)
    .with(false, () => "")
    .exhaustive();
}
