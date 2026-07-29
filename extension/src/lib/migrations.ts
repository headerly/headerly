import type { Filter, GroupItem, Profile } from "./schema";
import type { ProfileManager } from "./types";

type LegacyArrayFilterKey
  = | "resourceTypes"
    | "excludedResourceTypes"
    | "requestMethods"
    | "excludedRequestMethods"
    | "tabIds"
    | "excludedTabIds";

type ProfileFiltersV3 = Omit<Filter, LegacyArrayFilterKey> & {
  [K in LegacyArrayFilterKey]?: NonNullable<Filter[K]>["items"];
};

type ProfileV3 = Omit<Profile, "filters"> & {
  filters: ProfileFiltersV3;
};

type ProfileManagerV3 = Omit<ProfileManager, "profiles"> & {
  profiles: ProfileV3[];
};

type ProfileV2 = ProfileV3 & {
  ruleScope?: unknown;
};

type ProfileManagerV2 = Omit<ProfileManagerV3, "profiles"> & {
  profiles: ProfileV2[];
};

type ProfileManagerV1 = Omit<ProfileManagerV2, "profileGroups">;

function migrateArrayFilter<T extends GroupItem>(items: T[] | undefined): { type: "radio"; items: T[] } | undefined {
  if (items === undefined) {
    return undefined;
  }

  return {
    type: "radio",
    items,
  };
}

export const profileManagerMigrations = {
  2: (oldValue: ProfileManagerV1): ProfileManagerV2 => ({
    ...oldValue,
    profileGroups: [],
  }),
  3: (oldValue: ProfileManagerV2): ProfileManagerV3 => ({
    ...oldValue,
    profiles: oldValue.profiles.map(({ ruleScope: _ruleScope, ...profile }) => profile),
  }),
  4: (oldValue: ProfileManagerV3): ProfileManager => ({
    ...oldValue,
    profiles: oldValue.profiles.map(profile => ({
      ...profile,
      filters: {
        ...profile.filters,
        resourceTypes: migrateArrayFilter(profile.filters.resourceTypes),
        excludedResourceTypes: migrateArrayFilter(profile.filters.excludedResourceTypes),
        requestMethods: migrateArrayFilter(profile.filters.requestMethods),
        excludedRequestMethods: migrateArrayFilter(profile.filters.excludedRequestMethods),
        tabIds: migrateArrayFilter(profile.filters.tabIds),
        excludedTabIds: migrateArrayFilter(profile.filters.excludedTabIds),
      },
    })),
  }),
};
