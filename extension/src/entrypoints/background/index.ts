import type { ExtensionCommandId } from "@/lib/commands";
import type { Profile } from "@/lib/schema";
import { Mutex } from "async-mutex";
import { isEqual, pick } from "es-toolkit";
import { match, P } from "ts-pattern";
import { hasRegisterableAction } from "@/lib/profileRule";
import { usePowerOnStorage, useProfileId2ErrorMessageRecordStorage, useProfileManagerStorage } from "@/lib/storage";
import { setIconAndBadgeForDisabled, updateBadgeWhenRestarted } from "./DNR/badge";
import { reconcileRuleRegistrationState, updateRules } from "./DNR/registerRule";
import { unregisterAllRules } from "./DNR/unregisterAllRules";
import { onMessage } from "./message";
import { setupSyncCookies } from "./syncCookies";

export default defineBackground({
  type: "module",
  main() {
    const { item: powerOnItem } = usePowerOnStorage();
    const { item: profileManagerItem } = useProfileManagerStorage();
    const { item: profileId2ErrorMessageRecordItem } = useProfileId2ErrorMessageRecordStorage();
    // Serialize all DNR rule operations to prevent concurrent access.
    const profileManagerMutex = new Mutex();
    browser.commands.onCommand.addListener((command) => {
      match(command as ExtensionCommandId)
        .with("toggle-extension", async () => {
          profileManagerMutex.runExclusive(async () => {
            const powerOn = await powerOnItem.getValue();
            await powerOnItem.setValue(!powerOn);
          });
        });
    });
    // `storage.watch` must be registered synchronously at the top level of the service worker;
    // asynchronous registration will cause the service worker to lose events while in an inactive state.
    powerOnItem.watch((powerOn) => {
      profileManagerMutex.runExclusive(async () => {
        if (powerOn) {
          await treatAllProfilesAsCreated();
        } else {
          await unregisterAllRules();
          await setIconAndBadgeForDisabled();
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
          await updateRulesAndReconcile(changes);
        }
      });
    });
    setupSyncCookies({ profileManagerMutex, profileManagerItem });

    // Converge persisted profiles and the DNR rulesets whenever the worker starts.
    // Existing rules survive an ordinary worker restart, so only missing rules are added.
    ensureRulesAndUpdateBadge();
    // Also converge on explicit browser and extension lifecycle events. The mutex makes
    // overlapping startup triggers safe and the reconciliation keeps this idempotent.
    browser.runtime.onStartup.addListener(ensureRulesAndUpdateBadge);
    browser.runtime.onInstalled.addListener(ensureRulesAndUpdateBadge);

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

    const getRegisterableProfiles = (profiles: Profile[]) => {
      return profiles.filter(p => p.enabled && hasRegisterableAction(p));
    };

    async function treatAllProfilesAsCreated() {
      const manager = await profileManagerItem.getValue();
      // When power on, treat all profiles as created
      const changes = {
        deleted: [],
        modified: [],
        created: getRegisterableProfiles(manager.profiles).map(pickProfileFields),
      } as const satisfies ProfileChanges;
      await updateRulesAndReconcile(changes);
    }

    async function updateRulesAndReconcile(changes: ProfileChanges) {
      try {
        await updateRules(changes);
      } finally {
        await reconcileCurrentRulesAndUpdateBadge();
      }
    }

    async function reconcileCurrentRulesAndUpdateBadge() {
      const manager = await profileManagerItem.getValue();
      const registerableProfileIds = getRegisterableProfiles(manager.profiles).map(profile => profile.id);
      await reconcileRuleRegistrationState(registerableProfileIds);
      await updateBadgeWhenRestarted();
    }

    function ensureRulesAndUpdateBadge() {
      return profileManagerMutex.runExclusive(async () => {
        if (await powerOnItem.getValue()) {
          const manager = await profileManagerItem.getValue();
          const registerableProfiles = getRegisterableProfiles(manager.profiles).map(pickProfileFields);
          const registerableProfileIds = registerableProfiles.map(profile => profile.id);
          const validRegistrationRecord = await reconcileRuleRegistrationState(registerableProfileIds);
          const errorRecord = await profileId2ErrorMessageRecordItem.getValue();
          const missingProfiles = registerableProfiles.filter(profile =>
            !validRegistrationRecord[profile.id] && !errorRecord[profile.id],
          );
          if (missingProfiles.length > 0) {
            await updateRules({
              deleted: [],
              modified: [],
              created: missingProfiles,
            });
            await reconcileRuleRegistrationState(registerableProfileIds);
          }
          await updateBadgeWhenRestarted();
        } else {
          // Also recover if the worker stopped after power was persisted as off
          // but before its rules and registration records were removed.
          await unregisterAllRules();
          await updateBadgeWhenRestarted();
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
