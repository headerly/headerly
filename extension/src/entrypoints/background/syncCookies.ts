import type { Mutex } from "async-mutex";
import type { SyncCookie } from "@/lib/schema";
import type { useProfileManagerStorage } from "@/lib/storage";
import type { ProfileManager } from "@/lib/types";
import { isEqual } from "es-toolkit";
import { match } from "ts-pattern";

const SYNC_COOKIE_FLUSH_DELAY_MS = 500;

type ChangedCookie = Pick<Browser.cookies.Cookie, "domain" | "name" | "path" | "value">;
type CookieIdentity = Pick<ChangedCookie, "domain" | "name" | "path">;

/**
 * Keeps sync-cookie profile items aligned with the browser cookie jar.
 *
 * The popup stores the cookie identity fields in profiles. This background
 * synchronizer listens for cookie changes, reads current cookie values when
 * needed, and writes the latest values back into profile storage.
 */
export function setupSyncCookies(options: {
  profileManagerMutex: Mutex;
  profileManagerItem: ReturnType<typeof useProfileManagerStorage>["item"];
}) {
  const { profileManagerMutex, profileManagerItem } = options;
  // Cached identities let the cookie listener ignore unrelated cookie changes.
  let syncCookieKeys: Set<string> | undefined;
  // Cookie changes can arrive in bursts, so only the latest change per cookie is kept.
  const pendingSyncCookieChanges = new Map<string, { cookie: ChangedCookie; removed: boolean }>();
  let syncCookieFlushTimer: ReturnType<typeof setTimeout> | undefined;

  profileManagerItem.getValue().then(async (manager) => {
    syncCookieKeys = createSyncCookieKeySet(manager);
    await syncAllCookieValues();
  });

  profileManagerItem.watch((manager) => {
    const nextSyncCookieKeys = createSyncCookieKeySet(manager);
    const keysChanged = !areSetsEqual(syncCookieKeys, nextSyncCookieKeys);
    syncCookieKeys = nextSyncCookieKeys;
    if (keysChanged) {
      syncAllCookieValues();
    }
  });

  registerCookieChangeListener();

  // Optional permissions may be granted after the service worker starts.
  browser.permissions.onAdded.addListener((permissions) => {
    if (permissions.permissions?.includes("cookies")) {
      registerCookieChangeListener();
      syncAllCookieValues();
    }
  });

  function registerCookieChangeListener() {
    // Re-registering is harmless and keeps the listener active after permission changes.
    browser.cookies?.onChanged.removeListener(handleCookieChanged);
    browser.cookies?.onChanged.addListener(handleCookieChanged);
  }

  function handleCookieChanged(changeInfo: Browser.cookies.CookieChangeInfo) {
    if (!syncCookieKeys) {
      return;
    }
    if (!hasSyncCookieKey(syncCookieKeys, changeInfo.cookie)) {
      return;
    }
    pendingSyncCookieChanges.set(createSyncCookieKey(changeInfo.cookie), {
      cookie: changeInfo.cookie,
      removed: changeInfo.removed,
    });
    scheduleSyncCookieFlush();
  }

  function scheduleSyncCookieFlush() {
    if (syncCookieFlushTimer !== undefined) {
      clearTimeout(syncCookieFlushTimer);
    }
    syncCookieFlushTimer = setTimeout(flushSyncCookieChanges, SYNC_COOKIE_FLUSH_DELAY_MS);
  }

  function flushSyncCookieChanges() {
    syncCookieFlushTimer = undefined;
    const changes = [...pendingSyncCookieChanges.values()];
    pendingSyncCookieChanges.clear();

    if (changes.length === 0) {
      return;
    }

    profileManagerMutex.runExclusive(async () => {
      const manager = await profileManagerItem.getValue();
      // Apply all pending cookie changes to one storage snapshot before writing.
      let nextManager = manager;
      for (const change of changes) {
        nextManager = syncChangedCookieValue(nextManager, change.cookie, change.removed);
      }

      await setProfileManagerIfChanged(manager, nextManager);
    });
  }

  async function syncAllCookieValues() {
    if (!await hasCookiesPermission()) {
      return;
    }

    await profileManagerMutex.runExclusive(async () => {
      const manager = await profileManagerItem.getValue();
      const nextManager = await syncCurrentCookieValues(manager);
      await setProfileManagerIfChanged(manager, nextManager);
    });
  }

  async function setProfileManagerIfChanged(manager: ProfileManager, nextManager: ProfileManager) {
    if (!isEqual(manager, nextManager)) {
      syncCookieKeys = createSyncCookieKeySet(nextManager);
      await profileManagerItem.setValue(nextManager);
    }
  }
}

async function hasCookiesPermission() {
  return await browser.permissions?.contains({ permissions: ["cookies"] }) ?? false;
}

function createSyncCookieKeySet(manager: Pick<ProfileManager, "profiles">) {
  const keys = new Set<string>();

  for (const profile of manager.profiles) {
    for (const group of profile.syncCookieGroups ?? []) {
      for (const item of group.items) {
        if (hasValidCookieIdentity(item)) {
          keys.add(createSyncCookieKey(item));
        }
      }
    }
  }

  return keys;
}

function hasSyncCookieKey(keys: Set<string>, cookie: CookieIdentity) {
  return keys.has(createSyncCookieKey(cookie));
}

function areSetsEqual(a: Set<string> | undefined, b: Set<string>) {
  if (!a || a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}

function createSyncCookieKey(cookie: CookieIdentity) {
  // The extension only exposes domain, path, and name for sync-cookie matching.
  return `${cookie.domain}\n${cookie.path}\n${cookie.name}`;
}

function syncChangedCookieValue(
  manager: ProfileManager,
  changedCookie: ChangedCookie,
  removed: boolean,
) {
  const nextManager = structuredClone(manager);
  const nextValue = match(removed)
    .with(true, () => "")
    .with(false, () => changedCookie.value)
    .exhaustive();
  let changed = false;

  for (const profile of nextManager.profiles) {
    for (const group of profile.syncCookieGroups ?? []) {
      for (const item of group.items) {
        if (isSameCookie(item, changedCookie) && item.value !== nextValue) {
          item.value = nextValue;
          changed = true;
        }
      }
    }
  }

  return match(changed)
    .with(true, () => nextManager)
    .with(false, () => manager)
    .exhaustive();
}

async function syncCurrentCookieValues(manager: ProfileManager) {
  const nextManager = structuredClone(manager);
  // Multiple profile items can point to the same cookie; cache reads per identity.
  const cookieValueCache = new Map<string, Promise<string>>();
  let changed = false;

  for (const profile of nextManager.profiles) {
    for (const group of profile.syncCookieGroups ?? []) {
      for (const item of group.items) {
        if (!hasValidCookieIdentity(item)) {
          continue;
        }

        const value = await getCachedCookieValue(cookieValueCache, item);
        if (item.value !== value) {
          item.value = value;
          changed = true;
        }
      }
    }
  }

  return match(changed)
    .with(true, () => nextManager)
    .with(false, () => manager)
    .exhaustive();
}

function getCachedCookieValue(cache: Map<string, Promise<string>>, cookie: SyncCookie) {
  const key = createSyncCookieKey(cookie);
  if (!cache.has(key)) {
    cache.set(key, getCurrentCookieValue(cookie));
  }
  return cache.get(key)!;
}

async function getCurrentCookieValue(cookie: SyncCookie) {
  try {
    const cookies = await browser.cookies?.getAll({
      domain: cookie.domain,
      name: cookie.name,
    });
    return cookies?.find(currentCookie => isSameCookie(cookie, currentCookie))?.value ?? "";
  } catch {
    return "";
  }
}

function isSameCookie(
  item: CookieIdentity,
  changedCookie: CookieIdentity,
) {
  return createSyncCookieKey(item) === createSyncCookieKey(changedCookie);
}

function hasValidCookieIdentity(cookie: CookieIdentity) {
  return Boolean(cookie.domain.trim() && cookie.name.trim() && cookie.path.trim());
}
