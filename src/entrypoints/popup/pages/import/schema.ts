import { z } from "zod";

const groupItemWithoutIdSchema = z.object({
  enabled: z.boolean(),
  comments: z.string(),
});

const groupItemWithValueSchema = groupItemWithoutIdSchema.extend({
  value: z.string(),
});

const groupTypeSchema = z.enum(["radio", "checkbox"]);

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
]);

const domainTypeValueSchema = z.enum(["firstParty", "thirdParty"]);

const headerModSchema = z.union([
  // Remove operation (no value required)
  groupItemWithoutIdSchema.extend({
    name: z.string(),
    operation: z.literal("remove"),
  }),
  // Append/Set operations (value required)
  groupItemWithoutIdSchema.extend({
    name: z.string(),
    operation: z.enum(["append", "set"]),
    value: z.string(),
  }),
]);

const headerModGroupSchema = z.object({
  type: groupTypeSchema,
  items: z.array(headerModSchema),
});

const syncCookieSchema = groupItemWithoutIdSchema.extend({
  domain: z.string(),
  name: z.string(),
  value: z.string(),
  path: z.string(),
});

const syncCookieGroupSchema = z.object({
  type: groupTypeSchema,
  items: z.array(syncCookieSchema),
});

const urlOrRegexFilterSchema = groupItemWithValueSchema;

const domainsFilterSchema = z.object({
  type: groupTypeSchema,
  items: z.array(groupItemWithValueSchema),
});

const domainTypeFilterSchema = z.object({
  enabled: z.boolean(),
  value: domainTypeValueSchema,
});

const urlFilterCaseSensitiveSchema = z.object({
  enabled: z.boolean(),
  value: z.boolean(),
});

const filterSchema = z.object({
  urlFilter: z.array(urlOrRegexFilterSchema).optional(),
  regexFilter: z.array(urlOrRegexFilterSchema).optional(),
  initiatorDomains: domainsFilterSchema.optional(),
  excludedInitiatorDomains: domainsFilterSchema.optional(),
  requestDomains: domainsFilterSchema.optional(),
  excludedRequestDomains: domainsFilterSchema.optional(),
  resourceTypes: z.array(resourceTypeSchema).optional(),
  excludedResourceTypes: z.array(resourceTypeSchema).optional(),
  requestMethods: z.array(requestMethodSchema).optional(),
  excludedRequestMethods: z.array(requestMethodSchema).optional(),
  domainType: domainTypeFilterSchema.optional(),
  isUrlFilterCaseSensitive: urlFilterCaseSensitiveSchema.optional(),
});

// Zod Schema for Profile without any UUID fields
export const profileWithoutIdsZodSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  emoji: z.string(),
  comments: z.string(),
  requestHeaderModGroups: z.array(headerModGroupSchema),
  responseHeaderModGroups: z.array(headerModGroupSchema),
  syncCookieGroups: z.array(syncCookieGroupSchema),
  filters: filterSchema,
});

export type ProfileWithoutIds = z.infer<typeof profileWithoutIdsZodSchema>;

export const profileWithoutIdsJsonSchema = z.toJSONSchema(profileWithoutIdsZodSchema);
