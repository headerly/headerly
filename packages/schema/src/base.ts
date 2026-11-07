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

export const redirectUrlGroupItemSchema = groupItemWithValueSchema.meta({ description: "Fixed redirect destination in value. Use an absolute URL; regex capture substitution is not supported." });

export const groupTypeSchema = z.enum(["radio", "checkbox"]).meta({ description: "Selection mode: radio enables one item at a time in the editor; checkbox allows multiple enabled items." });

export function createFilterGroupSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    type: groupTypeSchema,
    items: z.array(itemSchema).meta({ description: "Available choices. Enabled values are combined and deduplicated; an empty list adds no restriction." }),
  });
}

export const profileGroupSchema = z.object({
  id: uuidSchemaWithDefault,
  name: z.string(),
  color: z.string().meta({ examples: ["#8ab4f8"] }),
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
] as const;
export const resourceTypeSchema = z.enum(RESOURCE_TYPES).meta({ description: "main_frame is the top-level document; sub_frame is an embedded frame. xmlhttprequest includes XHR and Fetch; ping includes beacon requests. Chrome determines the category." });

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
] as const;
export const requestMethodSchema = z.enum(REQUEST_METHODS).meta({ description: "Stored in lowercase; other matches methods outside the listed values." });

export const RULE_ACTION_TYPES = [
  "block",
  "redirect",
  "allow",
  "upgradeScheme",
  "modifyHeaders",
  "allowAllRequests",
] as const;

export const ruleActionTypeSchema = z.enum(RULE_ACTION_TYPES).meta({ description: "block stops requests; redirect uses a fixed URL; allow exempts a request from lower-priority Headerly rules; upgradeScheme upgrades HTTP/FTP to HTTPS; modifyHeaders changes headers or synchronizes cookies; allowAllRequests exempts a frame hierarchy and requires explicit main_frame/sub_frame resource types." });

export const DOMAIN_TYPES = [
  "firstParty",
  "thirdParty",
] as const;
export const domainTypeValueSchema = z.enum(DOMAIN_TYPES).meta({ description: "firstParty or thirdParty relative to the originating domain, as classified by Chrome." });

export const removeOperationSchema = groupItemSchema.extend({
  name: z.string(),
  operation: z.literal("remove").meta({ description: "Removes the header. No value is needed." }),
});

export const appendOrSetOperationSchema = groupItemSchema.extend({
  name: z.string(),
  operation: z.enum(["append", "set"]).meta({ description: "set replaces the header value; append adds a value subject to Chrome header restrictions." }),
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
  domain: z.string().meta({ description: "Exact source cookie domain, including any leading dot. Together with path and name, identifies the cookie." }),
  name: z.string(),
  value: z.string(),
  path: z.string(),
});

export const syncCookieGroupSchema = z.object({
  id: uuidSchemaWithDefault,
  type: groupTypeSchema,
  items: z.array(syncCookieSchema).meta({ description: "Cookies to synchronize. Enabled entries with a nonempty identity and value append name=value to the request Cookie header." }),
});
