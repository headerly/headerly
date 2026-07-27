import type { ProfileChanges } from "./diffProfiles";
import type { ExtensionCommandId } from "@/lib/commands";
import type { Profile } from "@/lib/schema";
import { Mutex } from "async-mutex";
import { match } from "ts-pattern";
import { usePowerOnStorage, useProfileManagerStorage } from "@/lib/storage";
import { diffProfiles, pickProfileFields } from "./diffProfiles";
import { setIconAndBadgeForDisabled, updateBadgeWhenRestarted } from "./DNR/badge";
import { reconcileRuleRegistrationState, updateRules } from "./DNR/registerRule";
import { unregisterAllRules } from "./DNR/unregisterAllRules";
import { onMessage } from "./message";
import { hasRegisterableAction, hasTemporaryTabBinding } from "./profileRule";
import { setupSyncCookies } from "./syncCookies";
import { setupTabIdCleanup } from "./tabIdCleanup";

export default defineBackground({
  type: "module",
  main() {
    const { item: powerOnItem } = usePowerOnStorage();
    const { item: profileManagerItem } = useProfileManagerStorage();
    // Serialize all DNR rule operations to prevent concurrent access.
    const profileManagerMutex = new Mutex();
    browser.commands.onCommand.addListener((command) => {
      match(command as ExtensionCommandId)
        .with("toggle-extension", async () => {
          profileManagerMutex.runExclusive(async () => {
            const powerOn = await powerOnItem.getValue();
            await powerOnItem.setValue(!powerOn);
          });
        })
        .exhaustive();
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
    setupTabIdCleanup({ profileManagerMutex, profileManagerItem });

    // Clean up orphaned DNR rules whenever the worker starts, then update the badge.
    reconcileRulesAndUpdateBadge();
    browser.runtime.onStartup.addListener(reconcileRulesAndUpdateBadge);
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === "update") {
        reRegisterTabBoundRulesAndUpdateBadge();
      } else {
        reconcileRulesAndUpdateBadge();
      }
    });

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

    function reconcileRulesAndUpdateBadge() {
      return profileManagerMutex.runExclusive(async () => {
        if (await powerOnItem.getValue()) {
          await reconcileCurrentRulesAndUpdateBadge();
        } else {
          // Also recover if the worker stopped after power was persisted as off
          // but before its rules and registration records were removed.
          await unregisterAllRules();
          await updateBadgeWhenRestarted();
        }
      });
    }

    function reRegisterTabBoundRulesAndUpdateBadge() {
      return profileManagerMutex.runExclusive(async () => {
        if (!await powerOnItem.getValue()) {
          await unregisterAllRules();
          await updateBadgeWhenRestarted();
          return;
        }

        const manager = await profileManagerItem.getValue();
        const registerableProfiles = getRegisterableProfiles(manager.profiles).map(pickProfileFields);
        const tabBoundProfiles = registerableProfiles.filter(hasTemporaryTabBinding);

        // Chrome clears session rules when an extension is updated. Tab IDs are
        // still valid inside that browser session, so rebuild every tab-bound
        // profile even if a stale registration record remains in local storage.
        if (tabBoundProfiles.length > 0) {
          await updateRules({
            modified: tabBoundProfiles,
          });
        }

        await reconcileCurrentRulesAndUpdateBadge();
      });
    }
  },
});
