import { pick } from "es-toolkit";
import { z } from "zod";
import { PROFILE_IMPORT_SCHEMA_VERSION } from "../const";
import { buildProfileBlocks } from "../profileBlocks";
import {
  appendOrSetOperationSchema,
  createFilterGroupSchema,
  groupItemWithValueSchema,
  headerModGroupSchema,
  profileGroupSchema,
  redirectUrlGroupItemSchema,
  removeOperationSchema,
  syncCookieGroupSchema,
  syncCookieSchema,
} from "./base";
import {
  domainsFilterSchema,
  filterSchema,
  requestMethodsFilterSchema,
  resourceTypesFilterSchema,
  urlOrRegexFilterSchema,
} from "./filters";
import { profileSchema } from "./profile";

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

/** Check every typed group, including groups nested inside profiles and filters. */
function validateExchangeGroups(value: unknown, ctx: z.RefinementCtx, path: PropertyKey[] = []) {
  if (Array.isArray(value)) {
    value.forEach((member, index) => validateExchangeGroups(member, ctx, [...path, index]));
    return;
  }
  if (typeof value !== "object" || value === null)
    return;

  const record = value as Record<string, unknown>;
  if (record.type === "radio" || record.type === "checkbox") {
    const memberKey = Array.isArray(record.profiles) ? "profiles" : "items";
    const members = record[memberKey];
    if (Array.isArray(members)) {
      if (members.length === 0) {
        ctx.addIssue({ code: "custom", path: [...path, memberKey], message: "A group must contain at least one item" });
      }
      const enabledCount = members.filter(member => typeof member === "object" && member !== null && "enabled" in member && member.enabled === true).length;
      if (record.type === "radio" && enabledCount > 1) {
        ctx.addIssue({
          code: "custom",
          path: [...path, memberKey],
          message: memberKey === "profiles"
            ? "A radio group can have at most one enabled profile"
            : "A radio group can have at most one enabled item",
        });
      }
    }
  }
  Object.entries(record).forEach(([key, member]) => validateExchangeGroups(member, ctx, [...path, key]));
}

/** Version 1 import format, retained for backward compatibility. */
export const profileExchangeLegacyV1Schema = z.object({
  version: z.literal(1),
  profiles: z.array(profileWithoutIdsZodSchema).min(1),
}).superRefine((exchange, ctx) => validateExchangeGroups(exchange, ctx));

const exchangeGroupSchema = z.object({
  kind: z.literal("group"),
  ...profileGroupSchema.pick({ name: true, color: true, type: true }).shape,
  profiles: z.array(profileWithoutIdsZodSchema),
});

const exchangeItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("profile"), profile: profileWithoutIdsZodSchema }),
  exchangeGroupSchema,
]);

const profileExchangeLatestStructureSchema = z.object({
  version: z.literal(PROFILE_IMPORT_SCHEMA_VERSION),
  items: z.array(exchangeItemSchema).min(1),
});

/** Always defines the latest export format; update this schema when the format evolves. */
export const profileExchangeLatestSchema = profileExchangeLatestStructureSchema
  .superRefine((exchange, ctx) => validateExchangeGroups(exchange, ctx));

export const profileExchangeZodSchema = z.discriminatedUnion("version", [profileExchangeLegacyV1Schema, profileExchangeLatestSchema]);
/** JSON Schema for editor validation of every supported import format. */
export const profileExchangeEditorJsonSchema = z.toJSONSchema(profileExchangeZodSchema, {
  // Refinements are not converted automatically. Describe the same group rules for
  // JSON Schema validators; the editor's Draft 4 linter only supports minItems,
  // so Zod remains authoritative for radio counts and the error indicator.
  override({ jsonSchema }) {
    const typeSchema = jsonSchema.properties?.type;
    if (!typeSchema || typeof typeSchema === "boolean"
      || !typeSchema.enum?.includes("radio") || !typeSchema.enum.includes("checkbox")) {
      return;
    }
    const memberKey = jsonSchema.properties?.profiles ? "profiles" : "items";
    const members = jsonSchema.properties?.[memberKey];
    if (!members || typeof members === "boolean")
      return;
    members.minItems = 1;
    jsonSchema.allOf = [{
      if: { properties: { type: { const: "radio" } }, required: ["type"] },
      then: {
        properties: {
          [memberKey]: {
            contains: { type: "object", properties: { enabled: { const: true } }, required: ["enabled"] },
            minContains: 0,
            maxContains: 1,
          },
        },
      },
    }];
  },
});

/**
 * Strip all id fields from profile.
 * Uses Zod parsing to automatically strip fields not defined in the schema.
 */
export function stripProfileIds(profile: z.infer<typeof profileSchema>) {
  return profileWithoutIdsZodSchema.parse(profile);
}

export function createProfileExchange(
  profiles: z.infer<typeof profileSchema>[],
  groups: z.infer<typeof profileGroupSchema>[] = [],
  selectedProfileIds = new Set(profiles.map(profile => profile.id)),
) {
  const items = buildProfileBlocks(profiles, groups).flatMap((block): z.infer<typeof exchangeItemSchema>[] => {
    if (block.kind === "profile") {
      return selectedProfileIds.has(block.profile.id)
        ? [{ kind: "profile", profile: stripProfileIds(block.profile) }]
        : [];
    }
    const members = block.profiles.filter(profile => selectedProfileIds.has(profile.id));
    if (!members.length)
      return [];
    return [{
      kind: "group",
      ...pick(block.group, ["name", "color", "type"]),
      profiles: members.map(stripProfileIds),
    }];
  });
  // Cookie values are never portable, regardless of the export entry point.
  for (const item of items) {
    for (const profile of item.kind === "group" ? item.profiles : [item.profile]) {
      for (const group of profile.syncCookieGroups ?? []) {
        for (const cookie of group.items)
          cookie.value = "";
      }
    }
  }
  // Local editing can leave unfinished groups. Keep their JSON visible so the editor
  // can explain validation failures instead of throwing before showing the preview.
  return profileExchangeLatestStructureSchema.parse({ version: PROFILE_IMPORT_SCHEMA_VERSION, items });
}

/** Validate the complete document before generating fresh IDs and restoring membership. */
export function restoreProfileExchange(input: unknown) {
  const exchange = profileExchangeZodSchema.parse(input);
  const profiles: z.infer<typeof profileSchema>[] = [];
  const profileGroups: z.infer<typeof profileGroupSchema>[] = [];
  if (exchange.version === 1) {
    profiles.push(...exchange.profiles.map(addProfileIds));
  } else {
    for (const item of exchange.items) {
      if (item.kind === "profile") {
        profiles.push(addProfileIds(item.profile));
        continue;
      }
      const group = profileGroupSchema.parse({ name: item.name, color: item.color, type: item.type });
      for (const member of item.profiles) {
        const profile = addProfileIds(member);
        profile.groupId = group.id;
        profiles.push(profile);
      }
      profileGroups.push(group);
    }
  }
  return { profiles, profileGroups };
}

/**
 * Add id fields to profile.
 * Uses z.default() in the schema to automatically generate new UUIDs.
 */
export function addProfileIds(profileWithoutIds: z.infer<typeof profileWithoutIdsZodSchema>) {
  return profileSchema.parse(profileWithoutIds);
}
