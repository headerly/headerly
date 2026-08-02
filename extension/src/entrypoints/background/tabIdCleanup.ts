import type { Mutex } from "async-mutex";
import type { useProfileManagerStorage } from "@/lib/storage";
import type { ProfileManager } from "@/lib/types";
import { hasEmptyTemporaryTabFilter } from "./profileRule";

const TAB_ID_CLEANUP_DELAY_MS = 500;
const TAB_ID_FILTER_KEYS = ["tabIds", "excludedTabIds"] as const;

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
    if (cleanupTimer !== undefined) {
      return;
    }

    // Closing a window emits one event per tab. Batch that burst into one
    // storage write to avoid conflicting profile updates.
    cleanupTimer = setTimeout(flushRemovedTabIds, TAB_ID_CLEANUP_DELAY_MS);
  });

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

export function removeClosedTabIds(
  manager: ProfileManager,
  removedTabIds: ReadonlySet<number>,
) {
  if (removedTabIds.size === 0) {
    return manager;
  }

  const nextManager = structuredClone(manager);
  let changed = false;

  for (const profile of nextManager.profiles) {
    let profileChanged = false;
    for (const key of TAB_ID_FILTER_KEYS) {
      for (const item of profile.filters[key]?.items ?? []) {
        const nextValue = item.value.filter(tabId => !removedTabIds.has(tabId));
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
