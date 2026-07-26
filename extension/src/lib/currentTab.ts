const CONTROLLABLE_TAB_PROTOCOLS = ["http:", "https:"];

export function isControllableTab(
  tab: Browser.tabs.Tab,
): tab is Browser.tabs.Tab & { id: number; url: string } {
  if (tab.id === undefined || !tab.url) {
    return false;
  }

  try {
    return CONTROLLABLE_TAB_PROTOCOLS.includes(new URL(tab.url).protocol);
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
    return CONTROLLABLE_TAB_PROTOCOLS.includes(url.protocol) ? url : undefined;
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
