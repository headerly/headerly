import type { Profile } from "@/lib/schema";
import { Mutex } from "async-mutex";
import { isEqual, pick } from "es-toolkit";
import { match, P } from "ts-pattern";
import { hasRegisterableAction } from "@/lib/profileRule";
import { usePowerOnStorage, useProfileManagerStorage } from "@/lib/storage";
import { reconcileRuleRegistrationState, updateRules } from "./DNR/registerRule";
import { unregisterAllRules } from "./DNR/unregisterAllRules";
import { setIconAndBadgeForDisabled, updateBadgeCount } from "./DNR/util";
import { onMessage } from "./message";
import { setupSyncCookies } from "./syncCookies";

export default defineBackground({
  type: "module",
  main() {
    const { item: powerOnItem } = usePowerOnStorage();
    const { item: profileManagerItem } = useProfileManagerStorage();
    // Serialize all DNR rule operations to prevent concurrent access.
    const profileManagerMutex = new Mutex();
    // `storage.watch` must be registered synchronously at the top level of the service worker;
    // asynchronous registration will cause the service worker to lose events while in an inactive state.
    powerOnItem.watch((powerOn) => {
      profileManagerMutex.runExclusive(async () => {
        if (powerOn) {
          await treatAllProfilesAsCreated();
          browser.action.setIcon({ path: `/${browser.runtime.getManifest().icons![32]!}` });
        } else {
          await unregisterAllRules();
          setIconAndBadgeForDisabled();
        }
      });
    });
    profileManagerItem.watch(({ profiles: newProfiles }, { profiles: oldProfiles }) => {
      profileManagerMutex.runExclusive(async () => {
        if (await powerOnItem.getValue()) {
          const changes = diffProfiles(oldProfiles, newProfiles);
          if (changes.deleted.length === 0 && changes.modified.length === 0 && changes.created.length === 0) {
            return;
          }
          await updateRules(changes);
        }
      });
    });
    setupSyncCookies({ profileManagerMutex, profileManagerItem });

    // Session rules can disappear while their profiles remain enabled. Reconcile persisted
    // registration state without automatically recreating those rules.
    updateBadgeWhenRestarted();
    // The following two scenarios will not activate the Service Worker, resulting in the loss of the badge.
    browser.runtime.onStartup.addListener(updateBadgeWhenRestarted);
    browser.runtime.onInstalled.addListener(updateBadgeWhenRestarted);

    // Manually Recover from a Failure
    onMessage("reinitializeAllRules", () => {
      profileManagerMutex.runExclusive(async () => {
        const powerOn = await powerOnItem.getValue();
        if (powerOn) {
          await unregisterAllRules();
          await treatAllProfilesAsCreated();
        } else {
          await unregisterAllRules();
        }
      });
    });
    onMessage("reinitializeProfileRule", ({ data: profileId }) => {
      return profileManagerMutex.runExclusive(async () => {
        const powerOn = await powerOnItem.getValue();
        const profile = (await profileManagerItem.getValue()).profiles.find(
          candidate => candidate.id === profileId,
        );
        if (!powerOn || !profile?.enabled || !hasRegisterableAction(profile)) {
          return;
        }
        await updateRules({
          deleted: [],
          created: [],
          modified: [pickProfileFields(profile)],
        });
      });
    });
    onMessage("openSharedProfilesImport", async ({ data: query, sender }) => {
      const importUrl = browser.runtime.getURL(`/popup.html#/import${query}`);
      if (sender.tab?.id !== undefined) {
        try {
          await browser.tabs.update(sender.tab.id, { url: importUrl });
          return;
        } catch (error) {
          console.error("Failed to open import page in the current tab:", error);
        }
      }
      await browser.tabs.create({ url: importUrl });
    });

    async function treatAllProfilesAsCreated() {
      const manager = await profileManagerItem.getValue();
      // When power on, treat all profiles as created
      const changes = {
        deleted: [],
        modified: [],
        created: manager.profiles.filter(p => p.enabled && hasRegisterableAction(p)).map(pickProfileFields),
      } as const satisfies ProfileChanges;
      await updateRules(changes);
    }

    function updateBadgeWhenRestarted() {
      profileManagerMutex.runExclusive(async () => {
        await reconcileRuleRegistrationState();
        if (await powerOnItem.getValue()) {
          await updateBadgeCount();
        } else {
          setIconAndBadgeForDisabled();
        }
      });
    }
  },
});

const NEED_WATCH_KEYS = [
  "enabled",
  "requestHeaderModGroups",
  "responseHeaderModGroups",
  "filters",
  "syncCookieGroups",
  "redirectUrlGroup",
  "priority",
  "ruleActionType",
  "ruleScope",
] as const satisfies (keyof Profile)[];
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
    const oldPickedProfile = oldPickedProfileMap.get(oldProfile.id)!;
    if (!newPickedProfileMap.has(oldPickedProfile.id)
      && oldPickedProfile.enabled
      && hasRegisterableAction(oldPickedProfile)) {
      deleted.push(oldPickedProfile);
    }
  }

  // Handle new and modified profiles
  for (const newProfile of newProfiles) {
    const oldPickedProfile = oldPickedProfileMap.get(newProfile.id);
    const newPickedProfile = pickProfileFields(newProfile);
    const wasActive = Boolean(oldPickedProfile?.enabled && hasRegisterableAction(oldPickedProfile));
    const isActive = newPickedProfile.enabled && hasRegisterableAction(newPickedProfile);
    const isModified = Boolean(oldPickedProfile
      && !isEqual(pick(oldPickedProfile, NEED_WATCH_KEYS), pick(newPickedProfile, NEED_WATCH_KEYS)));

    match([wasActive, isActive, isModified])
      .with([false, true, P._], () => created.push(newPickedProfile))
      .with([true, false, P._], () => deleted.push(newPickedProfile))
      .with([true, true, true], () => {
        modified.push(newPickedProfile);
      })
      .with([false, false, P._], () => {
        // No need to do anything for inactive profiles, even if they are modified or created, since they don't generate any DNR rules.
      })
      .with([true, true, false], () => {
        // No need to do anything if an active profile is modified but the fields that affect DNR rules are not changed.
      })
      .exhaustive();
  }

  return { deleted, modified, created };
}
