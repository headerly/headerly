import type { Profile, ProfileManager } from "@/lib/type";
import { debounce, isEqual, pick } from "es-toolkit";
import { usePowerOnStorage, useProfileManagerStorage } from "@/lib/storage";
import { registerBrowserApiService } from "./BrowserApiService";
import { unregisterAllRules, updateRules } from "./declarativeNetRequest";

export type ProfileCoreData = Pick<Profile, "id" | "enabled" | "requestHeaderModGroups" | "responseHeaderModGroups" | "filters" | "syncCookieGroups">;

export interface ProfileChanges {
  deleted: ProfileCoreData[];
  modified: ProfileCoreData[];
  created: ProfileCoreData[];
}

function pickProfileFields(profile: Profile): ProfileCoreData {
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
      created: newProfiles.map(pickProfileFields),
    };
  }

  const oldPickedProfileMap = new Map(oldProfiles.map(p => [p.id, pickProfileFields(p)]));
  const newPickedProfileMap = new Map(newProfiles.map(p => [p.id, pickProfileFields(p)]));

  const deleted = oldProfiles
    .filter(p => !newPickedProfileMap.has(p.id))
    .map(pickProfileFields);

  const created = newProfiles
    .filter(p => !oldPickedProfileMap.has(p.id))
    .map(pickProfileFields);

  const modified = newProfiles
    .filter((p) => {
      const oldPickedProfile = oldPickedProfileMap.get(p.id);
      const newPickedProfile = pickProfileFields(p);
      return oldPickedProfile && !isEqual(oldPickedProfile, newPickedProfile);
    })
    .map(pickProfileFields);

  return { deleted, modified, created };
}

export default defineBackground({
  type: "module",
  main() {
    registerBrowserApiService();
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
      if (powerOn) {
        debouncedPowerOnChange(powerOn);
      } else {
        unregisterAllRules();
      }
    });

    profileManagerItem.watch((manager) => {
      debouncedProfileManagerChange(manager!);
    });
  },
});
