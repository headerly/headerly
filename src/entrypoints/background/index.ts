import type { Profile, ProfileManager } from "@/lib/type";
import { debounce, isEqual, pick } from "es-toolkit";
import { usePowerOnStorage, useProfileManagerStorage } from "@/lib/storage";
import { unregisterAllRules, updateRules } from "./declarativeNetRequest";

export type ProfileCoreData = Pick<Profile, "id" | "requestHeaderModGroups" | "responseHeaderModGroups" | "filters" | "syncCookieGroups">;

export interface ProfileChanges {
  deleted: ProfileCoreData[];
  modified: ProfileCoreData[];
  created: ProfileCoreData[];
}

function pickProfileFields(profile: Profile) {
  return pick(profile, ["id", "enabled", "requestHeaderModGroups", "responseHeaderModGroups", "filters", "syncCookieGroups"]);
}

function diffProfiles(
  oldProfiles: Profile[] | null,
  newProfiles: Profile[],
): ProfileChanges {
  if (!oldProfiles) {
    return {
      deleted: [],
      modified: [],
      created: newProfiles.filter(p => p.enabled).map(pickProfileFields),
    };
  }

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
      } else if (isEnabled && !isEqual(oldPickedProfile, newPickedProfile)) {
        modified.push(newPickedProfile);
      }
    }
  }

  return { deleted, modified, created };
}

export default defineBackground({
  type: "module",
  main() {
    const { item: powerOnItem } = usePowerOnStorage();
    const { item: profileManagerItem } = useProfileManagerStorage();
    let lastProfiles: Profile[] | null = null;

    const debouncedPowerOnChange = debounce(async (powerOn: boolean) => {
      if (powerOn) {
        const manager = await profileManagerItem.getValue();
        // When power on, treat all profiles as created
        const changes: ProfileChanges = {
          deleted: [],
          modified: [],
          created: manager!.profiles.map(pickProfileFields),
        };
        await updateRules(changes);
      } else {
        await unregisterAllRules();
      }
    }, 500);

    const debouncedProfileManagerChange = debounce(async (manager: ProfileManager) => {
      if (await powerOnItem.getValue()) {
        // Service Worker restarts cause the in-memory mapping of profile IDs to rule IDs to be lost,
        // making targeted updates impossible.
        // Delete all rules and register them all.
        if (!lastProfiles) {
          await unregisterAllRules();
        }
        const changes = diffProfiles(lastProfiles, manager.profiles);
        // Skip if no meaningful changes detected (only check `ProfileCoreData` fields)
        if (changes.deleted.length === 0 && changes.modified.length === 0 && changes.created.length === 0) {
          return;
        }
        lastProfiles = manager.profiles;
        await updateRules(changes);
      }
    }, 500);

    powerOnItem.getValue().then((powerOn) => {
      debouncedPowerOnChange(powerOn!);
    });

    powerOnItem.watch((powerOn) => {
      debouncedPowerOnChange(powerOn!);
    });

    profileManagerItem.watch((manager) => {
      debouncedProfileManagerChange(manager!);
    });
  },
});
