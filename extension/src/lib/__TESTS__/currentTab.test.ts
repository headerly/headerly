import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentTabId, isControllableTab } from "../currentTab";

function createTab(id: number | undefined, url: string | undefined) {
  return { id, url } as Browser.tabs.Tab;
}

describe("isControllableTab", () => {
  it.each([
    "https://example.com/path",
    "http://localhost:3000/",
  ])("accepts a controllable URL: %s", (url) => {
    expect(isControllableTab(createTab(42, url))).toBe(true);
  });

  it.each([
    "chrome://newtab/",
    "chrome://extensions/",
    "chrome-extension://extension-id/popup.html",
    "about:blank",
    "data:text/plain,example",
    "file:///tmp/example.html",
  ])("rejects an internal or unsupported URL: %s", (url) => {
    expect(isControllableTab(createTab(42, url))).toBe(false);
  });

  it("rejects tabs whose ID or URL is unavailable", () => {
    expect(isControllableTab(createTab(undefined, "https://example.com"))).toBe(false);
    expect(isControllableTab(createTab(42, undefined))).toBe(false);
  });
});

describe("getCurrentTabId", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the current tab ID when the tab is controllable", async () => {
    vi.spyOn(browser.tabs, "query").mockImplementation(async () => [
      createTab(42, "https://example.com"),
    ]);

    await expect(getCurrentTabId()).resolves.toBe(42);
  });

  it("ignores the current tab when it is not controllable", async () => {
    vi.spyOn(browser.tabs, "query").mockImplementation(async () => [
      createTab(42, "chrome://extensions/"),
    ]);

    await expect(getCurrentTabId()).resolves.toBeUndefined();
  });
});
