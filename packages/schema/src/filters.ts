import { z } from "zod";
import {
  createFilterGroupSchema,
  domainTypeValueSchema,
  groupItemSchema,
  groupItemWithValueSchema,
  requestMethodSchema,
  resourceTypeSchema,
} from "./base.ts";

export const urlOrRegexFilterSchema = groupItemWithValueSchema;

const domainFilterItemSchema = groupItemWithValueSchema.extend({
  value: groupItemWithValueSchema.shape.value.meta({
    description: "Use ASCII hostnames, not URLs or paths. Subdomains also match. Use Punycode for internationalized names.",

  }),
});

export const domainsFilterSchema = createFilterGroupSchema(domainFilterItemSchema);

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
  urlFilter: z.array(urlOrRegexFilterSchema).optional().meta({ description: "URL patterns using Chrome syntax: * wildcard, | URL boundary, || domain boundary, ^ separator. Only the first enabled item is used. A nonempty enabled regex takes precedence. Use ASCII; surrounding whitespace is trimmed." }),
  regexFilter: z.array(urlOrRegexFilterSchema).optional().meta({ description: "URL patterns using RE2 syntax without /.../ delimiters. Only the first enabled item is used; a nonempty enabled regex takes precedence over urlFilter. Use ASCII and JSON-escaped backslashes. No lookaround or backreferences." }),
  initiatorDomains: domainsFilterSchema.optional().meta({ description: "Include requests originating from these domains." }),
  excludedInitiatorDomains: domainsFilterSchema.optional().meta({ description: "Exclude requests originating from these domains." }),
  requestDomains: domainsFilterSchema.optional().meta({ description: "Include requests sent to these destination domains." }),
  excludedRequestDomains: domainsFilterSchema.optional().meta({ description: "Exclude requests sent to these destination domains." }),
  topDomains: domainsFilterSchema.optional().meta({ description: "Include requests associated with these top-level page domains." }),
  excludedTopDomains: domainsFilterSchema.optional().meta({ description: "Exclude requests associated with these top-level page domains." }),
  resourceTypes: resourceTypesFilterGroupSchema.optional().meta({ description: "Include these resource categories. Use either resourceTypes or excludedResourceTypes. If neither supplies values, Headerly matches all types except for allowAllRequests, which needs explicit frame types." }),
  excludedResourceTypes: resourceTypesFilterGroupSchema.optional().meta({ description: "Exclude these resource categories. Use either resourceTypes or excludedResourceTypes." }),
  requestMethods: requestMethodsFilterGroupSchema.optional().meta({ description: "Include these HTTP methods. Also excludes non-HTTP(S) requests. Use either requestMethods or excludedRequestMethods." }),
  excludedRequestMethods: requestMethodsFilterGroupSchema.optional().meta({ description: "Exclude these HTTP methods without implicitly excluding non-HTTP(S) requests. Use either requestMethods or excludedRequestMethods." }),
  tabIds: tabIdsFilterGroupSchema.optional(),
  excludedTabIds: tabIdsFilterGroupSchema.optional(),
  tabGroups: tabGroupsFilterGroupSchema.optional(),
  excludedTabGroups: tabGroupsFilterGroupSchema.optional(),
  domainType: domainTypeFilterSchema.optional().meta({ description: "Limit requests to first-party or third-party traffic. When absent or disabled, both can match." }),
  isUrlFilterCaseSensitive: urlFilterCaseSensitiveSchema.optional().meta({ description: "Case sensitivity for urlFilter or regexFilter; defaults to case-insensitive when absent or disabled." }),
}).meta({ description: "Request conditions. Different condition types are combined with AND; enabled values within a list are alternatives. Exclusions remove matches. Empty or disabled choices add no restriction. Empty filters can apply broadly." });
