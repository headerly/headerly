import { z } from "zod";
import { PROFILE_IMPORT_SCHEMA_VERSION } from "../const";
import {
  appendOrSetOperationSchema,
  headerModGroupSchema,
  redirectUrlGroupItemSchema,
  removeOperationSchema,
  ruleActionTypeSchema,
  syncCookieGroupSchema,
  syncCookieSchema,
  uuidSchemaWithDefault,
} from "./base";
import { filterSchema, filterWithoutIdSchema } from "./fitlers";

export const profileSchema = z.object({
  id: uuidSchemaWithDefault,
  name: z.string(),
  enabled: z.boolean(),
  emoji: z.string(),
  groupId: z.uuid().optional(),
  comments: z.string().optional(),
  ruleActionType: ruleActionTypeSchema,
  priority: z.int().min(1).optional().meta({ description: "Range: 1 to 2^31 - 1, default: 1" }),
  requestHeaderModGroups: z.array(headerModGroupSchema).optional(),
  responseHeaderModGroups: z.array(headerModGroupSchema).optional(),
  syncCookieGroups: z.array(syncCookieGroupSchema).optional(),
  redirectUrlGroup: z.array(redirectUrlGroupItemSchema).optional(),
  filters: filterSchema,
});

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

const redirectUrlGroupItemWithoutIdSchema = redirectUrlGroupItemSchema.omit({ id: true });

export const profileWithoutIdsZodSchema = profileSchema.omit({ groupId: true, id: true }).extend({
  requestHeaderModGroups: z.array(headerModGroupWithoutIdSchema).optional(),
  responseHeaderModGroups: z.array(headerModGroupWithoutIdSchema).optional(),
  syncCookieGroups: z.array(syncCookieGroupWithoutIdSchema).optional(),
  redirectUrlGroup: z.array(redirectUrlGroupItemWithoutIdSchema).optional(),
  filters: filterWithoutIdSchema,
});

const profilesWithoutIdsArrayZodSchema = z.array(profileWithoutIdsZodSchema).min(1);

export const profileExchangeZodSchema = z.object({
  version: z.literal(PROFILE_IMPORT_SCHEMA_VERSION),
  profiles: profilesWithoutIdsArrayZodSchema,
});

export const profileExchangeJsonSchema = z.toJSONSchema(profileExchangeZodSchema);

/**
 * Strip all id fields from profile.
 * Uses Zod parsing to automatically strip fields not defined in the schema.
 */
export function stripProfileIds(profile: z.infer<typeof profileSchema>) {
  return profileWithoutIdsZodSchema.parse(profile);
}

export function createProfileExchange(profiles: z.infer<typeof profileSchema>[]) {
  return profileExchangeZodSchema.parse({
    version: PROFILE_IMPORT_SCHEMA_VERSION,
    profiles: profiles.map(stripProfileIds),
  });
}

/**
 * Add id fields to profile.
 * Uses z.default() in the schema to automatically generate new UUIDs.
 */
export function addProfileIds(profileWithoutIds: z.infer<typeof profileWithoutIdsZodSchema>) {
  return profileSchema.parse(profileWithoutIds);
}
