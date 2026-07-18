import type { Filter, Profile } from "./schema";
import { match } from "ts-pattern";
import { getObjectKeysWithTypeAssert } from "./object";

type ProfileFilterGroupType
  = Exclude<keyof Filter, "domainType" | "isUrlFilterCaseSensitive">;

export function getProfileFilterGroupOpenStateId(
  profileId: string,
  filterType: ProfileFilterGroupType,
) {
  return `${profileId}:${filterType}`;
}

export function getGroupOpenStateIds(profiles: Profile[]) {
  const ids = new Set<string>();

  for (const profile of profiles) {
    for (const profileKey of getObjectKeysWithTypeAssert(profile)) {
      match(profileKey)
        .with("requestHeaderModGroups", () => {
          profile.requestHeaderModGroups?.forEach(group =>
            ids.add(group.id),
          );
        })
        .with("responseHeaderModGroups", () => {
          profile.responseHeaderModGroups?.forEach(group =>
            ids.add(group.id),
          );
        })
        .with("syncCookieGroups", () => {
          profile.syncCookieGroups?.forEach(group => ids.add(group.id));
        })
        .with("redirectUrlGroup", () => {
          if (profile.redirectUrlGroup) {
            ids.add(profile.id);
          }
        })
        .with("filters", () => {
          for (const filterType of getObjectKeysWithTypeAssert(profile.filters)) {
            match(filterType)
              .with(
                "urlFilter",
                "regexFilter",
                "requestDomains",
                "excludedRequestDomains",
                "initiatorDomains",
                "excludedInitiatorDomains",
                "topDomains",
                "excludedTopDomains",
                "resourceTypes",
                "excludedResourceTypes",
                "requestMethods",
                "excludedRequestMethods",
                (filterGroupType: ProfileFilterGroupType) => {
                  if (profile.filters[filterGroupType]) {
                    ids.add(getProfileFilterGroupOpenStateId(profile.id, filterGroupType));
                  }
                },
              )
              .with("domainType", "isUrlFilterCaseSensitive", () => {})
              .exhaustive();
          }
        })
        .with(
          "id",
          "name",
          "enabled",
          "emoji",
          "groupId",
          "comments",
          "ruleScope",
          "ruleActionType",
          "priority",
          () => {},
        )
        .exhaustive();
    }
  }

  return ids;
}
