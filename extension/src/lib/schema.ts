import { uuidv7 } from "uuidv7";
import { z } from "zod";

const uuidSchema = z.uuid().default(() => uuidv7());
const groupItemSchema = z.object({
  enabled: z.boolean(),
  comments: z.string(),
  id: uuidSchema,
});
export type GroupItem = z.infer<typeof groupItemSchema>;

const groupItemWithValueSchema = groupItemSchema.extend({
  value: z.string(),
});

const groupTypeSchema = z.enum(["radio", "checkbox"]);
export type GroupType = z.infer<typeof groupTypeSchema>;

const resourceTypeSchema = z.enum([
  "main_frame",
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "csp_report",
  "media",
  "websocket",
  "webtransport",
  "webbundle",
  "other",
]);

const requestMethodSchema = z.enum([
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "patch",
  "post",
  "put",
  "other",
]);

const domainTypeValueSchema = z.enum(["firstParty", "thirdParty"]);

const removeOperationSchema = groupItemSchema.extend({
  name: z.string(),
  operation: z.literal("remove"),
});

const appendOrSetOperationSchema = groupItemSchema.extend({
  name: z.string(),
  operation: z.enum(["append", "set"]),
  value: z.string(),
});

const headerModSchema = z.union([
  removeOperationSchema,
  appendOrSetOperationSchema,
]);
export type HeaderMod = z.infer<typeof headerModSchema>;

const headerModGroupSchema = z.object({
  id: uuidSchema,
  type: groupTypeSchema,
  items: z.array(headerModSchema),
});
export type HeaderModGroup = z.infer<typeof headerModGroupSchema>;

const urlOrRegexFilterSchema = groupItemWithValueSchema;
export type UrlOrRegexFilterItem = z.infer<typeof urlOrRegexFilterSchema>;

const domainsFilterSchema = z.object({
  type: groupTypeSchema,
  items: z.array(groupItemWithValueSchema),
});
export type DomainsFilter = z.infer<typeof domainsFilterSchema>;

const resourceTypesFilterSchema = groupItemSchema.extend({
  value: z.array(resourceTypeSchema),
});

const requestMethodsFilterSchema = groupItemSchema.extend({
  value: z.array(requestMethodSchema),
});

const domainTypeFilterSchema = z.object({
  enabled: z.boolean(),
  value: domainTypeValueSchema,
});

const urlFilterCaseSensitiveSchema = z.object({
  enabled: z.boolean(),
  value: z.boolean(),
});

const syncCookieSchema = groupItemSchema.extend({
  domain: z.string(),
  name: z.string(),
  value: z.string(),
  path: z.string(),
});
export type SyncCookie = z.infer<typeof syncCookieSchema>;

const syncCookieGroupSchema = z.object({
  id: uuidSchema,
  type: groupTypeSchema,
  items: z.array(syncCookieSchema),
});
export type SyncCookieGroup = z.infer<typeof syncCookieGroupSchema>;

const filterSchema = z.object({
  urlFilter: z.array(urlOrRegexFilterSchema).optional(),
  regexFilter: z.array(urlOrRegexFilterSchema).optional(),
  initiatorDomains: domainsFilterSchema.optional(),
  excludedInitiatorDomains: domainsFilterSchema.optional(),
  requestDomains: domainsFilterSchema.optional(),
  excludedRequestDomains: domainsFilterSchema.optional(),
  resourceTypes: z.array(resourceTypesFilterSchema).optional(),
  excludedResourceTypes: z.array(resourceTypesFilterSchema).optional(),
  requestMethods: z.array(requestMethodsFilterSchema).optional(),
  excludedRequestMethods: z.array(requestMethodsFilterSchema).optional(),
  domainType: domainTypeFilterSchema.optional(),
  isUrlFilterCaseSensitive: urlFilterCaseSensitiveSchema.optional(),
});
export type Filter = z.infer<typeof filterSchema>;

const profileSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  enabled: z.boolean(),
  emoji: z.string(),
  comments: z.string(),
  priority: z.number().optional().meta({ description: "Range: 1 to 2^31 - 1, default: 1" }),
  requestHeaderModGroups: z.array(headerModGroupSchema),
  responseHeaderModGroups: z.array(headerModGroupSchema),
  syncCookieGroups: z.array(syncCookieGroupSchema),
  filters: filterSchema,
});
export type Profile = z.infer<typeof profileSchema>;

const removeOperationWithoutIdSchema = removeOperationSchema.omit({ id: true });
const appendOrSetOperationWithoutIdSchema = appendOrSetOperationSchema.omit({ id: true });

const headerModWithoutIdSchema = z.union([
  removeOperationWithoutIdSchema,
  appendOrSetOperationWithoutIdSchema,
]);

const headerModGroupWithoutIdSchema = headerModGroupSchema.omit({ id: true }).extend({
  items: z.array(headerModWithoutIdSchema),
});

const syncCookieWithoutIdSchema = syncCookieSchema.omit({ id: true });

const syncCookieGroupWithoutIdSchema = syncCookieGroupSchema.omit({ id: true }).extend({
  items: z.array(syncCookieWithoutIdSchema),
});

const urlOrRegexFilterWithoutIdSchema = urlOrRegexFilterSchema.omit({ id: true });

const domainsFilterWithoutIdSchema = domainsFilterSchema.extend({
  items: z.array(groupItemWithValueSchema.omit({ id: true })),
});

const resourceTypesFilterWithoutIdSchema = resourceTypesFilterSchema.omit({ id: true });
const requestMethodsFilterWithoutIdSchema = requestMethodsFilterSchema.omit({ id: true });

const filterWithoutIdSchema = filterSchema.extend({
  urlFilter: z.array(urlOrRegexFilterWithoutIdSchema).optional(),
  regexFilter: z.array(urlOrRegexFilterWithoutIdSchema).optional(),
  initiatorDomains: domainsFilterWithoutIdSchema.optional(),
  excludedInitiatorDomains: domainsFilterWithoutIdSchema.optional(),
  requestDomains: domainsFilterWithoutIdSchema.optional(),
  excludedRequestDomains: domainsFilterWithoutIdSchema.optional(),
  resourceTypes: z.array(resourceTypesFilterWithoutIdSchema).optional(),
  excludedResourceTypes: z.array(resourceTypesFilterWithoutIdSchema).optional(),
  requestMethods: z.array(requestMethodsFilterWithoutIdSchema).optional(),
  excludedRequestMethods: z.array(requestMethodsFilterWithoutIdSchema).optional(),
});

export const profileWithoutIdsZodSchema = profileSchema.omit({ id: true }).extend({
  requestHeaderModGroups: z.array(headerModGroupWithoutIdSchema),
  responseHeaderModGroups: z.array(headerModGroupWithoutIdSchema),
  syncCookieGroups: z.array(syncCookieGroupWithoutIdSchema),
  filters: filterWithoutIdSchema,
});

export type ProfileWithoutIds = z.infer<typeof profileWithoutIdsZodSchema>;

export const profileWithoutIdsJsonSchema = z.toJSONSchema(profileWithoutIdsZodSchema);

/**
 * Strip all id fields from profile
 * Uses zod parse feature to automatically strip fields not defined in schema (including all ids)
 */
export function stripProfileIds(profile: Profile) {
  return profileWithoutIdsZodSchema.parse(profile);
}

/**
 * Add id fields to profile
 * Uses z.default() in schema to automatically generate new UUIDs
 */
export function addProfileIds(profileWithoutIds: ProfileWithoutIds) {
  return profileSchema.parse(profileWithoutIds);
}
