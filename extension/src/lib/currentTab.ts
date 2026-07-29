import type { TabGroupBinding } from "./schema";

const CONTROLLABLE_TAB_PROTOCOLS = ["http:", "https:"];
const NO_GROUP_ID = -1;

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
  const currentTab = await getCurrentTab();
  return currentTab && isControllableTab(currentTab) ? currentTab.id : undefined;
}

export async function getCurrentTabGroupBinding(): Promise<TabGroupBinding | undefined> {
  const currentTab = await getCurrentTab();
  if (!currentTab || currentTab.groupId === undefined || currentTab.groupId === NO_GROUP_ID) {
    return undefined;
  }

  const tabs = await browser.tabs.query({ groupId: currentTab.groupId });
  return {
    groupId: currentTab.groupId,
    tabIds: tabs.flatMap(tab => tab.id === undefined ? [] : [tab.id]),
  };
}

export async function getCurrentTabHost() {
  return (await getCurrentTabHttpUrl())?.host ?? "";
}
