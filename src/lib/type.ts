import type { UUID } from "node:crypto";

export interface GroupItem {
  id: UUID;
  enabled: boolean;
  comments: string;
}

interface BaseMod extends GroupItem {
  name: string;
  operation: HeaderModOperation;
}

interface AppendOrSetMod extends BaseMod {
  operation: "append" | "set";
  value: string;
}

export interface RemoveMod extends BaseMod {
  operation: "remove";
}

export type HeaderMod = AppendOrSetMod | RemoveMod;

export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];

export interface UrlOrRegexFilter extends GroupItem {
  value: string;
}

export interface DomainsFilter {
  type: GroupType;
  items: ({ value: string } & GroupItem)[];
}

export interface ResourceTypeFilter extends GroupItem {
  value: `${Browser.declarativeNetRequest.ResourceType}`[];
}

export interface DomainTypeFilter {
  enabled: boolean;
  value: `${Browser.declarativeNetRequest.DomainType}`;
}

export interface Filter {
  urlFilter?: UrlOrRegexFilter[];
  regexFilter?: UrlOrRegexFilter[];
  initiatorDomains?: DomainsFilter;
  excludedInitiatorDomains?: DomainsFilter;
  requestDomains?: DomainsFilter;
  excludedRequestDomains?: DomainsFilter;
  resourceTypes?: ResourceTypeFilter[];
  excludedResourceTypes?: ResourceTypeFilter[];
  domainType?: DomainTypeFilter;
  isUrlFilterCaseSensitive?: {
    enabled: boolean;
    value: boolean;
  };
}

export type GroupType = "radio" | "checkbox";

export interface HeaderModGroup {
  id: UUID;
  type: GroupType;
  items: HeaderMod[];
}

export interface SyncCookie extends GroupItem {
  domain: string;
  name: string;
  value: string;
  // Only used to query new cookies after the first sync.
  path: string;
}

export interface SyncCookieGroup {
  id: UUID;
  type: GroupType;
  items: SyncCookie[];
}

export interface Profile {
  requestHeaderModGroups: HeaderModGroup[];
  responseHeaderModGroups: HeaderModGroup[];
  syncCookieGroups: SyncCookieGroup[];
  filters: Filter;
  id: UUID;
  name: string;
  enabled: boolean;
  emoji: string;
  comments: string;
}

export interface ProfileManager {
  profiles: Profile[];
  selectedProfileId: UUID;
}

export type ActionType = "request" | "response";
