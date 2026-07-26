import type { ProfileManager } from "@/lib/types";
import { Mutex } from "async-mutex";
import { describe, expect, it } from "vitest";
import { useProfileManagerStorage } from "@/lib/storage";
import { removeClosedTabIds, setupTabIdCleanup } from "../tabIdCleanup";

const profileId = "550e8400-e29b-41d4-a716-446655440000";

function createManager(): ProfileManager {
  return {
    profileGroups: [],
    profiles: [{
      id: profileId,
      name: "Tab-bound profile",
      enabled: true,
      emoji: "🧭",
      ruleActionType: "block",
      filters: {
        tabIds: [{
          id: "550e8400-e29b-41d4-a716-446655440001",
          enabled: true,
          value: [41, 42, 43],
        }],
        excludedTabIds: [{
          id: "550e8400-e29b-41d4-a716-446655440002",
          enabled: true,
          value: [42, 44],
        }],
      },
    }],
    selectedProfileId: profileId,
  };
}

describe("removeClosedTabIds", () => {
  it("removes every closed tab ID from included and excluded filters", () => {
    const manager = createManager();

    const result = removeClosedTabIds(manager, new Set([42, 43]));

    expect(result.profiles[0]!.filters.tabIds![0]!.value).toEqual([41]);
    expect(result.profiles[0]!.filters.excludedTabIds![0]!.value).toEqual([44]);
    expect(manager.profiles[0]!.filters.tabIds![0]!.value).toEqual([41, 42, 43]);
  });

  it("reuses the existing manager when no stored tab ID was removed", () => {
    const manager = createManager();

    expect(removeClosedTabIds(manager, new Set([99]))).toBe(manager);
  });
});

describe("setupTabIdCleanup", () => {
  it("persists cleanup when a tab is closed", async () => {
    const profileManagerItem = useProfileManagerStorage().item;
    const profileManagerMutex = new Mutex();
    await profileManagerItem.setValue(createManager());
    setupTabIdCleanup({ profileManagerMutex, profileManagerItem });

    await triggerTabRemoved(42);
    await new Promise(resolve => setTimeout(resolve, 150));
    await profileManagerMutex.waitForUnlock();

    const manager = await profileManagerItem.getValue();
    expect(manager.profiles[0]!.filters.tabIds![0]!.value).toEqual([41, 43]);
    expect(manager.profiles[0]!.filters.excludedTabIds![0]!.value).toEqual([44]);
  });
});

function triggerTabRemoved(tabId: number) {
  const onRemoved = browser.tabs.onRemoved as typeof browser.tabs.onRemoved & {
    trigger: (
      tabId: number,
      removeInfo: { isWindowClosing: boolean; windowId: number },
    ) => Promise<void[]>;
  };
  return onRemoved.trigger(tabId, { isWindowClosing: false, windowId: 1 });
}
