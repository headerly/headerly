import type { Mutex } from "async-mutex";
import type { TabGroupBinding } from "@/lib/schema";
import type { useProfileManagerStorage } from "@/lib/storage";
import type { ProfileManager } from "@/lib/types";
import { isEqual } from "es-toolkit";
import { TAB_GROUP_ID_NONE } from "@/lib/const";
import { hasEmptyTemporaryTabFilter } from "./profileRule";

const TAB_GROUP_SYNC_DELAY_MS = 500;
const TAB_GROUP_FILTER_KEYS = ["tabGroups", "excludedTabGroups"] as const;

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
  let shouldClearAllBindings = false;
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
      shouldRefreshAllBindings = true;
      scheduleSync();
    }
  });
  browser.runtime.onStartup.addListener(() => {
    shouldClearAllBindings = true;
    scheduleSync();
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

  // Delay the initial refresh so onStartup can invalidate bindings from a
  // previous browser session before their session-only group IDs are queried.
  scheduleSync();

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
    const clearAllBindings = shouldClearAllBindings;
    pendingRemovedGroupIds.clear();
    pendingRemovedTabIds.clear();
    shouldRefreshAllBindings = false;
    shouldClearAllBindings = false;

    return profileManagerMutex.runExclusive(async () => {
      const manager = await profileManagerItem.getValue();
      let nextManager = manager;

      if (removedGroupIds.size > 0 || removedTabIds.size > 0) {
        nextManager = removeTabGroupBindings(nextManager, removedGroupIds, removedTabIds);
      }

      if (clearAllBindings) {
        nextManager = clearTabGroupBindings(nextManager);
      } else if (refreshAllBindings) {
        const refreshedTabIdsByGroupId = await querySelectedTabGroups(nextManager);
        nextManager = refreshTabGroupBindings(nextManager, refreshedTabIdsByGroupId);
      }

      if (nextManager !== manager) {
        await profileManagerItem.setValue(nextManager);
      }
    });
  }
}

async function querySelectedTabGroups(manager: ProfileManager) {
  const groupIds = new Set(getTabGroupBindings(manager).map(binding => binding.groupId));

  const refreshedTabIdsByGroupId = new Map<number, number[]>();
  await Promise.all(Array.from(groupIds).map(async (groupId) => {
    const tabs = await browser.tabs.query({ groupId });
    refreshedTabIdsByGroupId.set(
      groupId,
      tabs.flatMap(tab => tab.id === undefined ? [] : [tab.id]),
    );
  }));
  return refreshedTabIdsByGroupId;
}

function getTabGroupBindings(manager: ProfileManager) {
  return manager.profiles.flatMap(profile =>
    TAB_GROUP_FILTER_KEYS.flatMap(key =>
      (profile.filters[key]?.items ?? []).flatMap(item => item.value),
    ),
  );
}

function updateTabGroupBindings(
  manager: ProfileManager,
  callback: (binding: TabGroupBinding) => TabGroupBinding | undefined,
) {
  const nextManager = structuredClone(manager);
  let changed = false;
  for (const profile of nextManager.profiles) {
    let profileChanged = false;
    for (const key of TAB_GROUP_FILTER_KEYS) {
      for (const item of profile.filters[key]?.items ?? []) {
        const nextValue = item.value.flatMap((binding) => {
          const nextBinding = callback(binding);
          return nextBinding ? [nextBinding] : [];
        });
        if (!isEqual(nextValue, item.value)) {
          item.value = nextValue;
          changed = true;
          profileChanged = true;
        }
      }
    }
    if (profileChanged && profile.enabled && hasEmptyTemporaryTabFilter(profile)) {
      profile.enabled = false;
    }
  }

  return changed ? nextManager : manager;
}

export function clearTabGroupBindings(manager: ProfileManager) {
  return updateTabGroupBindings(manager, () => undefined);
}

export function removeTabGroupBindings(
  manager: ProfileManager,
  removedGroupIds: ReadonlySet<number>,
  removedTabIds: ReadonlySet<number>,
) {
  return updateTabGroupBindings(manager, (binding) => {
    if (removedGroupIds.has(binding.groupId)) {
      return undefined;
    }

    return {
      groupId: binding.groupId,
      tabIds: binding.tabIds.filter(tabId => !removedTabIds.has(tabId)),
    };
  });
}

export function refreshTabGroupBindings(
  manager: ProfileManager,
  refreshedTabIdsByGroupId: ReadonlyMap<number, readonly number[]>,
) {
  return updateTabGroupBindings(manager, (binding) => {
    const refreshedTabIds = refreshedTabIdsByGroupId.get(binding.groupId);
    if (refreshedTabIds === undefined) {
      return binding;
    }

    // A Chrome tab group cannot exist without tabs. An empty successful query
    // therefore means that the persisted session-only group ID is stale.
    return refreshedTabIds.length === 0
      ? undefined
      : { groupId: binding.groupId, tabIds: [...refreshedTabIds] };
  });
}
