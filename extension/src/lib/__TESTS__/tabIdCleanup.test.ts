import type { ProfileManager } from "../types";
import { Mutex } from "async-mutex";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setupTabIdCleanup } from "../../entrypoints/background/tabIdCleanup";
import { createProfile } from "../profileFactory";

describe("tab session initialization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("finishes old-session cleanup before marking initialization and preserves new bindings", async () => {
    vi.useFakeTimers();
    const target = createProfile({
      enabled: true,
      filters: { tabIds: { type: "checkbox", items: [{ id: "old", enabled: true, value: [41] }] } },
    });
    let manager: ProfileManager = { profiles: [target], profileGroups: [], selectedProfileId: target.id };
    let initialized = false;
    const mutex = new Mutex();
    const startup = vi.spyOn(browser.runtime.onStartup, "addListener").mockImplementation(() => {});
    vi.spyOn(browser.tabs.onRemoved, "addListener").mockImplementation(() => {});
    vi.spyOn(browser.storage.session, "get").mockImplementation(async () => initialized ? { headerlyTabSessionInitialized: true } : {});
    const markInitialized = vi.spyOn(browser.storage.session, "set").mockImplementation(async () => {
      expect(manager.profiles[0]?.filters.tabIds?.items[0]?.value).toEqual([]);
      initialized = true;
    });
    const getValue = vi.fn(async () => manager);
    const setValue = vi.fn(async (value: ProfileManager) => {
      expect(initialized).toBe(false);
      manager = value;
    });
    setupTabIdCleanup({
      profileManagerMutex: mutex,
      profileManagerItem: { getValue, setValue } as unknown as Parameters<typeof setupTabIdCleanup>[0]["profileManagerItem"],
    });
    await mutex.waitForUnlock();
    expect(markInitialized).toHaveBeenCalledOnce();
    expect(manager.profiles[0]?.enabled).toBe(false);

    manager.profiles[0]!.enabled = true;
    manager.profiles[0]!.filters.tabIds!.items[0]!.value = [42];
    // onStartup can arrive after the worker's initial setup; it must not
    // schedule a second cleanup of bindings from the current session.
    startup.mock.calls[0]![0]();
    await mutex.waitForUnlock();
    await vi.advanceTimersByTimeAsync(1000);
    expect(manager.profiles[0]?.filters.tabIds?.items[0]?.value).toEqual([42]);
    expect(manager.profiles[0]?.enabled).toBe(true);
    expect(setValue).toHaveBeenCalledOnce();
  });

  it("preserves current-session selections when the service worker restarts", async () => {
    const mutex = new Mutex();
    vi.spyOn(browser.runtime.onStartup, "addListener").mockImplementation(() => {});
    vi.spyOn(browser.tabs.onRemoved, "addListener").mockImplementation(() => {});
    vi.spyOn(browser.storage.session, "get").mockImplementation(async () => ({ headerlyTabSessionInitialized: true }));
    const markInitialized = vi.spyOn(browser.storage.session, "set");
    const getValue = vi.fn();
    const setValue = vi.fn();
    setupTabIdCleanup({
      profileManagerMutex: mutex,
      profileManagerItem: { getValue, setValue } as unknown as Parameters<typeof setupTabIdCleanup>[0]["profileManagerItem"],
    });
    await mutex.waitForUnlock();
    expect(getValue).not.toHaveBeenCalled();
    expect(setValue).not.toHaveBeenCalled();
    expect(markInitialized).not.toHaveBeenCalled();
  });
});
