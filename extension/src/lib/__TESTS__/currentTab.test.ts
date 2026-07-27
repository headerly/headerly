import { describe, expect, it } from "vitest";
import { isControllableTab } from "../currentTab";

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
