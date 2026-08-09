import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const uuidSchemaWithDefault = z.uuid().default(() => uuidv7());

export const groupItemSchema = z.object({
  enabled: z.boolean(),
  comments: z.string().optional(),
  id: uuidSchemaWithDefault,
});

export const groupItemWithValueSchema = groupItemSchema.extend({
  value: z.string(),
});

export const redirectUrlGroupItemSchema = groupItemWithValueSchema;

export const groupTypeSchema = z.enum(["radio", "checkbox"]);

export function createFilterGroupSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    type: groupTypeSchema,
    items: z.array(itemSchema),
  });
}

export const profileGroupSchema = z.object({
  id: uuidSchemaWithDefault,
  name: z.string(),
  color: z.string(),
  type: groupTypeSchema,
  lastEnabledProfileIds: z.array(z.uuid()).optional(),
});

export const RESOURCE_TYPES = [
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
] as const satisfies `${Browser.declarativeNetRequest.ResourceType}`[];
export const resourceTypeSchema = z.enum(RESOURCE_TYPES);

export const ALLOW_ALL_REQUESTS_RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
] as const satisfies (typeof RESOURCE_TYPES)[number][];

export const REQUEST_METHODS = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "patch",
  "post",
  "put",
  "other",
] as const satisfies `${Browser.declarativeNetRequest.RequestMethod}`[];
export const requestMethodSchema = z.enum(REQUEST_METHODS);

export const RULE_ACTION_TYPES = [
  "block",
  "redirect",
  "allow",
  "upgradeScheme",
  "modifyHeaders",
  "allowAllRequests",
] as const satisfies `${Browser.declarativeNetRequest.RuleActionType}`[];

export const ruleActionTypeSchema = z.enum(RULE_ACTION_TYPES);

export const DOMAIN_TYPES = [
  "firstParty",
  "thirdParty",
] as const satisfies `${Browser.declarativeNetRequest.DomainType}`[];
export const domainTypeValueSchema = z.enum(DOMAIN_TYPES);

export const removeOperationSchema = groupItemSchema.extend({
  name: z.string(),
  operation: z.literal("remove"),
});

export const appendOrSetOperationSchema = groupItemSchema.extend({
  name: z.string(),
  operation: z.enum(["append", "set"]),
  value: z.string(),
});

export const headerModSchema = z.union([
  removeOperationSchema,
  appendOrSetOperationSchema,
]);

export const headerModGroupSchema = z.object({
  id: uuidSchemaWithDefault,
  type: groupTypeSchema,
  items: z.array(headerModSchema),
});

export const syncCookieSchema = groupItemSchema.extend({
  domain: z.string(),
  name: z.string(),
  value: z.string(),
  path: z.string(),
});

export const syncCookieGroupSchema = z.object({
  id: uuidSchemaWithDefault,
  type: groupTypeSchema,
  items: z.array(syncCookieSchema),
});
