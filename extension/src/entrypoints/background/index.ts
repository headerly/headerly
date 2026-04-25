import type { Profile } from "@/lib/schema";
import { Mutex } from "async-mutex";
import { isEqual, pick } from "es-toolkit";
import { match, P } from "ts-pattern";
import { usePowerOnStorage, useProfileManagerStorage } from "@/lib/storage";
import { buildAction } from "./DNR/buildAction";
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
    // The following two scenarios will not activate the Service Worker, resulting in the loss of the badge.
    browser.runtime.onStartup.addListener(updateBadgeWhenRestarted);
    browser.runtime.onInstalled.addListener(updateBadgeWhenRestarted);

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
        created: manager.profiles.filter(p => p.enabled && isNotEmptyModifyHeaderRule(p)).map(pickProfileFields),
      } as const satisfies ProfileChanges;
      await updateRules(changes);
      lastProfilesStorageItem.setValue(manager.profiles);
    }
  },
});

const NEED_WATCH_KEYS = [
  "enabled",
  "requestHeaderModGroups",
  "responseHeaderModGroups",
  "filters",
  "syncCookieGroups",
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

function isNotEmptyModifyHeaderRule(profile: ProfileCoreData) {
  const action = buildAction(profile);
  return !(
    action.type === "modifyHeaders"
    && (!action.requestHeaders || action.requestHeaders.length === 0)
    && (!action.responseHeaders || action.responseHeaders.length === 0)
  );
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
      && isNotEmptyModifyHeaderRule(oldPickedProfile)) {
      deleted.push(oldPickedProfile);
    }
  }

  // Handle new and modified profiles
  for (const newProfile of newProfiles) {
    const oldPickedProfile = oldPickedProfileMap.get(newProfile.id);
    const newPickedProfile = pickProfileFields(newProfile);

    const wasActive = Boolean(oldPickedProfile?.enabled && isNotEmptyModifyHeaderRule(oldPickedProfile));
    const isActive = newPickedProfile.enabled && isNotEmptyModifyHeaderRule(newPickedProfile);
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
