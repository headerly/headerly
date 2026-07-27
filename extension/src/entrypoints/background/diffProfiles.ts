import type { Profile } from "@/lib/schema";
import { isEqual, pick } from "es-toolkit";
import { match, P } from "ts-pattern";
import { hasRegisterableAction } from "./profileRule";

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

export function pickProfileFields(profile: Profile) {
  return pick(profile, CORE_KEYS);
}

export function diffProfiles(
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
