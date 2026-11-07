import type { Profile, ProfileGroup } from "./type.ts";

export type ProfileBlock
  = | { kind: "profile"; id: string; profile: Profile }
    | { kind: "group"; id: string; group: ProfileGroup; profiles: Profile[] };

export function buildProfileBlocks(profiles: Profile[], groups: ProfileGroup[]): ProfileBlock[] {
  const groupsById = new Map(groups.map(group => [group.id, group]));
  const members = new Map<string, Profile[]>();
  for (const profile of profiles) {
    if (profile.groupId) {
      const entries = members.get(profile.groupId) ?? [];
      entries.push(profile);
      members.set(profile.groupId, entries);
    }
  }
  const added = new Set<string>();
  return profiles.flatMap((profile): ProfileBlock[] => {
    const group = profile.groupId ? groupsById.get(profile.groupId) : undefined;
    if (!group)
      return [{ kind: "profile", id: profile.id, profile }];
    if (added.has(group.id))
      return [];
    added.add(group.id);
    return [{ kind: "group", id: group.id, group, profiles: members.get(group.id)! }];
  });
}
