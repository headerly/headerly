import { match } from "ts-pattern";

const CONTROLLABLE_TAB_PROTOCOLS = new Set(["http:", "https:", "file:"]);

export function isControllableTab(
  tab: Browser.tabs.Tab,
): tab is Browser.tabs.Tab & { id: number; url: string } {
  if (tab.id === undefined || !tab.url) {
    return false;
  }

  try {
    return CONTROLLABLE_TAB_PROTOCOLS.has(new URL(tab.url).protocol);
  } catch {
    return false;
  }
}

export async function getCurrentTab() {
  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
  return currentTab;
}

async function getCurrentTabHttpUrl() {
  const currentTab = await getCurrentTab();
  if (!currentTab?.url) {
    return undefined;
  }

  try {
    const url = new URL(currentTab.url);
    return match(url.protocol)
      .with("http:", "https:", () => url)
      .otherwise(() => undefined);
  } catch {
    return undefined;
  }
}

export async function getCurrentTabHostname() {
  return (await getCurrentTabHttpUrl())?.hostname ?? "";
}

export async function getCurrentTabId() {
  return (await getCurrentTab())?.id;
}

export async function getCurrentTabHost() {
  return (await getCurrentTabHttpUrl())?.host ?? "";
}
