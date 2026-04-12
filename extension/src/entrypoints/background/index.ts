import type { Profile } from "@/lib/schema";
import { Mutex } from "async-mutex";
import { isEqual, pick } from "es-toolkit";
import { usePowerOnStorage, useProfileId2RelatedRuleIdRecordStorage, useProfileId2RuleScopeRecordStorage, useProfileManagerStorage } from "@/lib/storage";
import { updateRules } from "./DNR/registerRule";
import { unregisterAllRules } from "./DNR/unregisterAllRules";
import { updateBadgeCount } from "./DNR/util";
import { onMessage } from "./message";

const lastProfilesStorageItem = storage.defineItem<Profile[]>(
  "local:lastProfiles",
  {
    fallback: [],
  },
);

export default defineBackground({
  type: "module",
  main() {
    const { item: powerOnItem } = usePowerOnStorage();
    const { item: profileManagerItem } = useProfileManagerStorage();
    // Serialize all DNR rule operations to prevent concurrent access.
    const mutex = new Mutex();
    // `storage.watch` must be registered synchronously at the top level of the service worker;
    // asynchronous registration will cause the service worker to lose events while in an inactive state.
    powerOnItem.watch((powerOn) => {
      mutex.runExclusive(async () => {
        if (powerOn) {
          await treatAllProfilesAsCreated();
          browser.action.setIcon({ path: `/${browser.runtime.getManifest().icons![32]!}` });
        } else {
          await unregisterAllRules();
          lastProfilesStorageItem.setValue([]);
          setIconAndBadgeForDisabled();
        }
      });
    });
    profileManagerItem.watch((manager) => {
      mutex.runExclusive(async () => {
        if (await powerOnItem.getValue()) {
          const lastProfiles = await lastProfilesStorageItem.getValue();
          const changes = diffProfiles(lastProfiles, manager.profiles);
          if (changes.deleted.length === 0 && changes.modified.length === 0 && changes.created.length === 0) {
            return;
          }
          await updateRules(changes);
          lastProfilesStorageItem.setValue(manager.profiles);
        }
      });
    });

    // Update the badge when the service worker is restarted, such as toggle extension on/off in chrome://extensions
    updateBadgeWhenRestarted();
    disableOrphanedSessionProfiles();
    // The following two scenarios will not activate the Service Worker, resulting in the loss of the badge.
    browser.runtime.onStartup.addListener(() => {
      updateBadgeWhenRestarted();
      disableOrphanedSessionProfiles();
    });
    browser.runtime.onInstalled.addListener(() => {
      updateBadgeWhenRestarted();
      disableOrphanedSessionProfiles();
    });

    // Manually Recover from a Failure
    onMessage("reinitializeAllRules", () => {
      mutex.runExclusive(async () => {
        const powerOn = await powerOnItem.getValue();
        if (powerOn) {
          await unregisterAllRules();
          await treatAllProfilesAsCreated();
        } else {
          await unregisterAllRules();
          lastProfilesStorageItem.setValue([]);
        }
      });
    });

    async function treatAllProfilesAsCreated() {
      const manager = await profileManagerItem.getValue();
      // When power on, treat all profiles as created
      const changes = {
        deleted: [],
        modified: [],
        created: manager.profiles.filter(p => p.enabled).map(pickProfileFields),
      } as const satisfies ProfileChanges;
      await updateRules(changes);
      lastProfilesStorageItem.setValue(manager.profiles);
    }
  },
});

const NEED_WATCH_KEYS = ["enabled", "requestHeaderModGroups", "responseHeaderModGroups", "filters", "syncCookieGroups", "priority", "ruleScope"] as const satisfies (keyof Profile)[];
const CORE_KEYS = [...NEED_WATCH_KEYS, "id"] as const satisfies (keyof Profile)[];
export type ProfileCoreData = Pick<Profile, typeof CORE_KEYS[number]>;

export interface ProfileChanges {
  deleted: ProfileCoreData[];
  modified: ProfileCoreData[];
  created: ProfileCoreData[];
}

function pickProfileFields(profile: Profile) {
  return pick(profile, CORE_KEYS);
}

function diffProfiles(
  oldProfiles: Profile[],
  newProfiles: Profile[],
): ProfileChanges {
  const oldPickedProfileMap = new Map(oldProfiles.map(p => [p.id, pickProfileFields(p)]));
  const newPickedProfileMap = new Map(newProfiles.map(p => [p.id, pickProfileFields(p)]));

  const deleted: ProfileCoreData[] = [];
  const created: ProfileCoreData[] = [];
  const modified: ProfileCoreData[] = [];

  // Handle deleted profiles
  for (const oldProfile of oldProfiles) {
    if (!newPickedProfileMap.has(oldProfile.id) && oldProfile.enabled) {
      deleted.push(pickProfileFields(oldProfile));
    }
  }

  // Handle new and modified profiles
  for (const newProfile of newProfiles) {
    const oldPickedProfile = oldPickedProfileMap.get(newProfile.id);
    const newPickedProfile = pickProfileFields(newProfile);

    if (!oldPickedProfile) {
      if (newProfile.enabled) {
        created.push(newPickedProfile);
      }
    } else {
      const wasEnabled = oldPickedProfile.enabled;
      const isEnabled = newPickedProfile.enabled;

      if (wasEnabled && !isEnabled) {
        deleted.push(newPickedProfile);
      } else if (!wasEnabled && isEnabled) {
        created.push(newPickedProfile);
      } else if (isEnabled && !isEqual(pick(oldPickedProfile, NEED_WATCH_KEYS), pick(newPickedProfile, NEED_WATCH_KEYS))) {
        modified.push(newPickedProfile);
      }
    }
  }

  return { deleted, modified, created };
}

function setIconAndBadgeForDisabled() {
  browser.action.setBadgeTextColor({ color: "white" });
  browser.action.setBadgeBackgroundColor({ color: "gray" });
  browser.action.setBadgeText({ text: "❚❚" });
  const SIZE = 32;
  const iconPath = `/${browser.runtime.getManifest().icons![SIZE]!}`;
  fetch(iconPath)
    .then(response => response.blob())
    .then(blob => createImageBitmap(blob))
    .then((imageBitmap) => {
      const canvas = new OffscreenCanvas(SIZE, SIZE);
      const context = canvas.getContext("2d")!;
      context.filter = "grayscale(100%)";
      context.drawImage(imageBitmap, 0, 0);
      const imageData = context.getImageData(0, 0, SIZE, SIZE);
      browser.action.setIcon({ imageData });
    });
}

async function updateBadgeWhenRestarted() {
  const powerOn = await usePowerOnStorage().item.getValue();
  if (powerOn) {
    await updateBadgeCount();
  } else {
    setIconAndBadgeForDisabled();
  }
}

/**
 * After browser restart or extension update, session rules are lost.
 * Detect orphaned session-scoped profiles and disable them.
 */
async function disableOrphanedSessionProfiles() {
  const { item: profileManagerItem } = useProfileManagerStorage();
  const { item: profileId2RelatedRuleIdRecordItem } = useProfileId2RelatedRuleIdRecordStorage();
  const { item: profileId2RuleScopeRecordItem } = useProfileId2RuleScopeRecordStorage();

  const [sessionRules, ruleScopeRecord, ruleIdRecord, manager] = await Promise.all([
    browser.declarativeNetRequest.getSessionRules(),
    profileId2RuleScopeRecordItem.getValue(),
    profileId2RelatedRuleIdRecordItem.getValue(),
    profileManagerItem.getValue(),
  ]);

  const survivingSessionRuleIds = new Set(sessionRules.map(r => r.id));
  const orphanedProfileIds: string[] = [];

  for (const [profileId, scope] of Object.entries(ruleScopeRecord)) {
    if (scope !== "session")
      continue;
    const ruleId = ruleIdRecord[profileId];
    if (ruleId !== undefined && !survivingSessionRuleIds.has(ruleId)) {
      orphanedProfileIds.push(profileId);
    }
  }

  if (orphanedProfileIds.length === 0)
    return;

  // Disable orphaned session profiles and clean up records
  let modified = false;
  for (const profile of manager.profiles) {
    if (orphanedProfileIds.includes(profile.id) && profile.enabled) {
      profile.enabled = false;
      modified = true;
    }
  }

  const newRuleIdRecord = { ...ruleIdRecord };
  const newRuleScopeRecord = { ...ruleScopeRecord };
  for (const id of orphanedProfileIds) {
    delete newRuleIdRecord[id];
    delete newRuleScopeRecord[id];
  }

  await Promise.all([
    modified ? profileManagerItem.setValue(manager) : undefined,
    profileId2RelatedRuleIdRecordItem.setValue(newRuleIdRecord),
    profileId2RuleScopeRecordItem.setValue(newRuleScopeRecord),
  ]);
}
