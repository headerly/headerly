import type { Mutex } from "async-mutex";
import type { useProfileManagerStorage } from "@/lib/storage";
import type { ProfileManager } from "@/lib/types";
import { hasEmptyTemporaryTabFilter } from "./profileRule";

const TAB_ID_CLEANUP_DELAY_MS = 500;
const TAB_ID_FILTER_KEYS = ["tabIds", "excludedTabIds"] as const;
const tabSessionInitializedItem = storage.defineItem<boolean>("session:headerlyTabSessionInitialized", {
  fallback: false,
});

/** Removes closed tab IDs from persisted profile filters. */
export function setupTabIdCleanup(options: {
  profileManagerMutex: Mutex;
  profileManagerItem: ReturnType<typeof useProfileManagerStorage>["item"];
}) {
  const { profileManagerMutex, profileManagerItem } = options;
  const pendingRemovedTabIds = new Set<number>();
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined;

  browser.tabs.onRemoved.addListener((tabId) => {
    pendingRemovedTabIds.add(tabId);
    scheduleCleanup();
  });
  browser.runtime.onStartup.addListener(initializeTabSession);
  initializeTabSession();

  function initializeTabSession() {
    return profileManagerMutex.runExclusive(async () => {
      if (await tabSessionInitializedItem.getValue()) {
        return;
      }
      // onRemoved batches cleanup behind a 500 ms timer. Browser shutdown can
      // terminate the worker before cleanup is persisted, leaving old tab IDs
      // in storage even though the next session uses new IDs. Clear those stale
      // bindings once per browser session; onRemoved alone cannot guarantee it.
      // Clear the previous session before accepting new bindings. Delaying this
      // like tab-close events also clears selections created during startup.
      const manager = await profileManagerItem.getValue();
      const nextManager = clearTabIds(manager);
      if (nextManager !== manager) {
        await profileManagerItem.setValue(nextManager);
      }
      // A worker interrupted during cleanup must retry on its next start.
      await tabSessionInitializedItem.setValue(true);
    });
  }

  function scheduleCleanup() {
    if (cleanupTimer !== undefined) {
      return;
    }

    // Closing a window emits one event per tab. Batch that burst into one
    // storage write to avoid conflicting profile updates.
    cleanupTimer = setTimeout(flushRemovedTabIds, TAB_ID_CLEANUP_DELAY_MS);
  }

  function flushRemovedTabIds() {
    cleanupTimer = undefined;
    const removedTabIds = new Set(pendingRemovedTabIds);
    pendingRemovedTabIds.clear();

    profileManagerMutex.runExclusive(async () => {
      const manager = await profileManagerItem.getValue();
      const nextManager = removeClosedTabIds(manager, removedTabIds);
      if (nextManager !== manager) {
        await profileManagerItem.setValue(nextManager);
      }
    });
  }
}

function clearTabIds(manager: ProfileManager) {
  return filterTabIds(manager, () => false);
}

function removeClosedTabIds(
  manager: ProfileManager,
  removedTabIds: ReadonlySet<number>,
) {
  if (removedTabIds.size === 0) {
    return manager;
  }

  return filterTabIds(manager, tabId => !removedTabIds.has(tabId));
}

function filterTabIds(manager: ProfileManager, keepTabId: (tabId: number) => boolean) {
  const nextManager = structuredClone(manager);
  let changed = false;

  for (const profile of nextManager.profiles) {
    let profileChanged = false;
    for (const key of TAB_ID_FILTER_KEYS) {
      for (const item of profile.filters[key]?.items ?? []) {
        const nextValue = item.value.filter(keepTabId);
        if (nextValue.length !== item.value.length) {
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
