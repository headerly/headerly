import { match } from "ts-pattern";

async function getCurrentTabHttpUrl() {
  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
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

export async function getCurrentTabHost() {
  return (await getCurrentTabHttpUrl())?.host ?? "";
}
