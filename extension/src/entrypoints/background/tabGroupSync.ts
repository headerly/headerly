import type { Mutex } from "async-mutex";
import type { useProfileManagerStorage } from "@/lib/storage";
import type { ProfileManager } from "@/lib/types";
import { isEqual } from "es-toolkit";
import { TAB_GROUP_ID_NONE } from "@/lib/const";

const TAB_GROUP_SYNC_DELAY_MS = 500;
const TAB_GROUP_FILTER_KEYS = ["tabGroups", "excludedTabGroups"] as const;

interface TabGroupBindingChanges {
  removedGroupIds?: ReadonlySet<number>;
  removedTabIds?: ReadonlySet<number>;
  refreshedTabIdsByGroupId?: ReadonlyMap<number, readonly number[]>;
}

/**
 * Keeps the persisted tab snapshot for every selected group aligned with the
 * live tabs in that group. Event listeners are registered synchronously so a
 * newly started service worker cannot miss lifecycle events.
 */
export function setupTabGroupSync(options: {
  profileManagerMutex: Mutex;
  profileManagerItem: ReturnType<typeof useProfileManagerStorage>["item"];
}) {
  const { profileManagerMutex, profileManagerItem } = options;
  const pendingRemovedGroupIds = new Set<number>();
  const pendingRemovedTabIds = new Set<number>();
  let shouldRefreshAllBindings = true;
  let syncTimer: ReturnType<typeof setTimeout> | undefined;

  browser.tabs.onRemoved.addListener((tabId) => {
    pendingRemovedTabIds.add(tabId);
    scheduleSync();
  });
  function onTabGroupRemoved(group: Browser.tabGroups.TabGroup) {
    pendingRemovedGroupIds.add(group.id);
    scheduleSync();
  }
  browser.tabGroups?.onRemoved.addListener(onTabGroupRemoved);
  browser.permissions.onAdded.addListener(({ permissions }) => {
    if (permissions?.includes("tabGroups")) {
      browser.tabGroups.onRemoved.addListener(onTabGroupRemoved);
    }
  });

  browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    if (changeInfo.groupId !== undefined) {
      shouldRefreshAllBindings = true;
      scheduleSync();
    }
  });
  browser.tabs.onCreated.addListener((tab) => {
    if (tab.groupId !== TAB_GROUP_ID_NONE) {
      shouldRefreshAllBindings = true;
      scheduleSync();
    }
  });

  // Running this once also covers browser startup, extension updates, and any
  // later service-worker restart.
  void flushPendingChanges();

  function scheduleSync() {
    if (syncTimer !== undefined) {
      return;
    }
    syncTimer = setTimeout(flushPendingChanges, TAB_GROUP_SYNC_DELAY_MS);
  }

  function flushPendingChanges() {
    if (syncTimer !== undefined) {
      clearTimeout(syncTimer);
      syncTimer = undefined;
    }
    const removedGroupIds = new Set(pendingRemovedGroupIds);
    const removedTabIds = new Set(pendingRemovedTabIds);
    const refreshAllBindings = shouldRefreshAllBindings;
    pendingRemovedGroupIds.clear();
    pendingRemovedTabIds.clear();
    shouldRefreshAllBindings = false;

    return profileManagerMutex.runExclusive(async () => {
      const manager = await profileManagerItem.getValue();
      const managerAfterRemovals = applyTabGroupBindingChanges(manager, {
        removedGroupIds,
        removedTabIds,
      });
      const refreshedTabIdsByGroupId = refreshAllBindings
        ? await querySelectedTabGroups(managerAfterRemovals)
        : undefined;
      const nextManager = applyTabGroupBindingChanges(managerAfterRemovals, {
        refreshedTabIdsByGroupId,
      });
      if (nextManager !== manager) {
        await profileManagerItem.setValue(nextManager);
      }
    });
  }
}

async function querySelectedTabGroups(manager: ProfileManager) {
  const groupIds = new Set<number>();
  for (const profile of manager.profiles) {
    for (const key of TAB_GROUP_FILTER_KEYS) {
      for (const item of profile.filters[key]?.items ?? []) {
        item.value.forEach(binding => groupIds.add(binding.groupId));
      }
    }
  }

  const refreshedTabIdsByGroupId = new Map<number, number[]>();
  await Promise.all([...groupIds].map(async (groupId) => {
    try {
      const tabs = await browser.tabs.query({ groupId });
      refreshedTabIdsByGroupId.set(
        groupId,
        tabs.flatMap(tab => tab.id === undefined ? [] : [tab.id]),
      );
    } catch (error) {
      // Preserve the last known snapshot if Chrome temporarily rejects a query.
      console.error(`Failed to refresh tab group ${groupId}:`, error);
    }
  }));
  return refreshedTabIdsByGroupId;
}

export function applyTabGroupBindingChanges(
  manager: ProfileManager,
  changes: TabGroupBindingChanges,
) {
  const {
    removedGroupIds = new Set(),
    removedTabIds = new Set(),
    refreshedTabIdsByGroupId,
  } = changes;
  const nextManager = structuredClone(manager);
  let changed = false;

  for (const profile of nextManager.profiles) {
    for (const key of TAB_GROUP_FILTER_KEYS) {
      for (const item of profile.filters[key]?.items ?? []) {
        const nextValue = item.value.flatMap((binding) => {
          if (removedGroupIds.has(binding.groupId)) {
            return [];
          }

          const hasRefreshedTabs = refreshedTabIdsByGroupId?.has(binding.groupId) ?? false;
          const tabIds = hasRefreshedTabs
            ? [...refreshedTabIdsByGroupId!.get(binding.groupId)!]
            : binding.tabIds.filter(tabId => !removedTabIds.has(tabId));

          // A Chrome tab group cannot exist without tabs. An empty successful
          // query therefore means that the persisted session-only group ID is stale.
          return hasRefreshedTabs && tabIds.length === 0
            ? []
            : [{ ...binding, tabIds }];
        });
        if (!isEqual(nextValue, item.value)) {
          item.value = nextValue;
          changed = true;
        }
      }
    }
  }

  return changed ? nextManager : manager;
}
