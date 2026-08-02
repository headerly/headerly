import type { z } from "zod";
import type {
  groupItemSchema,
  groupTypeSchema,
  headerModGroupSchema,
  headerModSchema,
  profileGroupSchema,
  redirectUrlGroupItemSchema,
  resourceTypeSchema,
  ruleActionTypeSchema,
  syncCookieGroupSchema,
  syncCookieSchema,
} from "./base";
import type {
  domainsFilterSchema,
  filterSchema,
  requestMethodsFilterGroupSchema,
  resourceTypesFilterGroupSchema,
  tabGroupBindingSchema,
  tabGroupsFilterGroupSchema,
  tabGroupsFilterSchema,
  tabIdsFilterGroupSchema,
  tabIdsFilterSchema,
  urlOrRegexFilterSchema,
} from "./fitlers";
import type { profileExchangeZodSchema, profileSchema, profileWithoutIdsZodSchema } from "./profile";

export type GroupItem = z.infer<typeof groupItemSchema>;
export type RedirectUrlGroupItem = z.infer<typeof redirectUrlGroupItemSchema>;
export type GroupType = z.infer<typeof groupTypeSchema>;
export type ProfileGroup = z.infer<typeof profileGroupSchema>;
export type ResourceType = z.infer<typeof resourceTypeSchema>;
export type RuleActionType = z.infer<typeof ruleActionTypeSchema>;
export type HeaderMod = z.infer<typeof headerModSchema>;
export type HeaderModGroup = z.infer<typeof headerModGroupSchema>;
export type UrlOrRegexFilterItem = z.infer<typeof urlOrRegexFilterSchema>;
export type DomainsFilter = z.infer<typeof domainsFilterSchema>;
export type ResourceTypesFilterGroup = z.infer<typeof resourceTypesFilterGroupSchema>;
export type RequestMethodsFilterGroup = z.infer<typeof requestMethodsFilterGroupSchema>;
export type TabIdsFilterItem = z.infer<typeof tabIdsFilterSchema>;
export type TabIdsFilterGroup = z.infer<typeof tabIdsFilterGroupSchema>;
export type TabGroupBinding = z.infer<typeof tabGroupBindingSchema>;
export type TabGroupsFilterItem = z.infer<typeof tabGroupsFilterSchema>;
export type TabGroupsFilterGroup = z.infer<typeof tabGroupsFilterGroupSchema>;
export type SyncCookie = z.infer<typeof syncCookieSchema>;
export type SyncCookieGroup = z.infer<typeof syncCookieGroupSchema>;
export type Filter = z.infer<typeof filterSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ProfileWithoutIds = z.infer<typeof profileWithoutIdsZodSchema>;
export type ProfileExchange = z.infer<typeof profileExchangeZodSchema>;
