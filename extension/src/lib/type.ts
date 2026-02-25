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

export interface UrlOrRegexFilterItem extends GroupItem {
  value: string;
}

export interface DomainsFilter {
  type: GroupType;
  items: ({ value: string } & GroupItem)[];
}

export interface DomainTypeFilter {
  enabled: boolean;
  value: `${Browser.declarativeNetRequest.DomainType}`;
}

export interface ResourceTypesFilterItem extends GroupItem {
  value: `${Browser.declarativeNetRequest.ResourceType}`[];
}

export interface RequestMethodsFilterItem extends GroupItem {
  value: `${Browser.declarativeNetRequest.RequestMethod}`[];
}

export interface Filter {
  urlFilter?: UrlOrRegexFilterItem[];
  regexFilter?: UrlOrRegexFilterItem[];
  initiatorDomains?: DomainsFilter;
  excludedInitiatorDomains?: DomainsFilter;
  requestDomains?: DomainsFilter;
  excludedRequestDomains?: DomainsFilter;
  resourceTypes?: ResourceTypesFilterItem[];
  excludedResourceTypes?: ResourceTypesFilterItem[];
  requestMethods?: RequestMethodsFilterItem[];
  excludedRequestMethods?: RequestMethodsFilterItem[];
  domainType?: DomainTypeFilter;
  isUrlFilterCaseSensitive?: {
    enabled: boolean;
    value: boolean;
  };
  tabIds?: {
    enabled: boolean;
    value: number[];
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
  /** Range: 1 to 2^31 - 1, default: 1 */
  priority?: number;
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
