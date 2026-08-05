import { z } from "zod";
import {
  createFilterGroupSchema,
  domainTypeValueSchema,
  groupItemSchema,
  groupItemWithValueSchema,
  requestMethodSchema,
  resourceTypeSchema,
} from "./base";

export const urlOrRegexFilterSchema = groupItemWithValueSchema;

export const domainsFilterSchema = createFilterGroupSchema(groupItemWithValueSchema);

export const resourceTypesFilterSchema = groupItemSchema.extend({
  value: z.array(resourceTypeSchema),
});

export const resourceTypesFilterGroupSchema = createFilterGroupSchema(resourceTypesFilterSchema);

export const requestMethodsFilterSchema = groupItemSchema.extend({
  value: z.array(requestMethodSchema),
});

export const requestMethodsFilterGroupSchema = createFilterGroupSchema(requestMethodsFilterSchema);

export const tabIdsFilterSchema = groupItemSchema.extend({
  value: z.array(z.int().nonnegative()),
});

export const tabIdsFilterGroupSchema = createFilterGroupSchema(tabIdsFilterSchema);

export const tabGroupBindingSchema = z.object({
  groupId: z.int().nonnegative(),
  tabIds: z.array(z.int().nonnegative()),
});

export const tabGroupsFilterSchema = groupItemSchema.extend({
  value: z.array(tabGroupBindingSchema),
});

export const tabGroupsFilterGroupSchema = createFilterGroupSchema(tabGroupsFilterSchema);

const domainTypeFilterSchema = z.object({
  enabled: z.boolean(),
  value: domainTypeValueSchema,
});

const urlFilterCaseSensitiveSchema = z.object({
  enabled: z.boolean(),
  value: z.boolean(),
});

export const filterSchema = z.object({
  urlFilter: z.array(urlOrRegexFilterSchema).optional(),
  regexFilter: z.array(urlOrRegexFilterSchema).optional(),
  initiatorDomains: domainsFilterSchema.optional(),
  excludedInitiatorDomains: domainsFilterSchema.optional(),
  requestDomains: domainsFilterSchema.optional(),
  excludedRequestDomains: domainsFilterSchema.optional(),
  topDomains: domainsFilterSchema.optional(),
  excludedTopDomains: domainsFilterSchema.optional(),
  resourceTypes: resourceTypesFilterGroupSchema.optional(),
  excludedResourceTypes: resourceTypesFilterGroupSchema.optional(),
  requestMethods: requestMethodsFilterGroupSchema.optional(),
  excludedRequestMethods: requestMethodsFilterGroupSchema.optional(),
  tabIds: tabIdsFilterGroupSchema.optional(),
  excludedTabIds: tabIdsFilterGroupSchema.optional(),
  tabGroups: tabGroupsFilterGroupSchema.optional(),
  excludedTabGroups: tabGroupsFilterGroupSchema.optional(),
  domainType: domainTypeFilterSchema.optional(),
  isUrlFilterCaseSensitive: urlFilterCaseSensitiveSchema.optional(),
});

const urlOrRegexFilterWithoutIdSchema = urlOrRegexFilterSchema.omit({ id: true });

const domainsFilterWithoutIdSchema = domainsFilterSchema.extend({
  items: z.array(groupItemWithValueSchema.omit({ id: true })),
});

const resourceTypesFilterWithoutIdSchema = resourceTypesFilterSchema.omit({ id: true });
const requestMethodsFilterWithoutIdSchema = requestMethodsFilterSchema.omit({ id: true });

const resourceTypesFilterGroupWithoutIdSchema = createFilterGroupSchema(resourceTypesFilterWithoutIdSchema);
const requestMethodsFilterGroupWithoutIdSchema = createFilterGroupSchema(requestMethodsFilterWithoutIdSchema);

export const filterWithoutIdSchema = filterSchema.extend({
  urlFilter: z.array(urlOrRegexFilterWithoutIdSchema).optional(),
  regexFilter: z.array(urlOrRegexFilterWithoutIdSchema).optional(),
  initiatorDomains: domainsFilterWithoutIdSchema.optional(),
  excludedInitiatorDomains: domainsFilterWithoutIdSchema.optional(),
  requestDomains: domainsFilterWithoutIdSchema.optional(),
  excludedRequestDomains: domainsFilterWithoutIdSchema.optional(),
  topDomains: domainsFilterWithoutIdSchema.optional(),
  excludedTopDomains: domainsFilterWithoutIdSchema.optional(),
  resourceTypes: resourceTypesFilterGroupWithoutIdSchema.optional(),
  excludedResourceTypes: resourceTypesFilterGroupWithoutIdSchema.optional(),
  requestMethods: requestMethodsFilterGroupWithoutIdSchema.optional(),
  excludedRequestMethods: requestMethodsFilterGroupWithoutIdSchema.optional(),
}).omit({ tabIds: true, excludedTabIds: true, tabGroups: true, excludedTabGroups: true });
