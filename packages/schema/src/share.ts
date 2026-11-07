import { pick } from "es-toolkit";
import { z } from "zod";
import {
  appendOrSetOperationSchema,
  createFilterGroupSchema,
  headerModGroupSchema,
  profileGroupSchema,
  redirectUrlGroupItemSchema,
  removeOperationSchema,
  syncCookieGroupSchema,
  syncCookieSchema,
} from "./base.ts";
import { PROFILE_IMPORT_SCHEMA_VERSION } from "./const.ts";
import {
  domainsFilterSchema,
  filterSchema,
  requestMethodsFilterSchema,
  resourceTypesFilterSchema,
  urlOrRegexFilterSchema,
} from "./filters.ts";
import { profileSchema } from "./profile.ts";
import { buildProfileBlocks } from "./profileBlocks.ts";

const urlOrRegexFilterWithoutIdSchema = urlOrRegexFilterSchema.omit({ id: true });

const domainsFilterWithoutIdSchema = domainsFilterSchema.extend({
  items: z.array(domainsFilterSchema.shape.items.element.omit({ id: true })).meta(domainsFilterSchema.shape.items.meta() ?? {}),
});

const resourceTypesFilterWithoutIdSchema = resourceTypesFilterSchema.omit({ id: true });
const requestMethodsFilterWithoutIdSchema = requestMethodsFilterSchema.omit({ id: true });

const resourceTypesFilterGroupWithoutIdSchema = createFilterGroupSchema(resourceTypesFilterWithoutIdSchema);
const requestMethodsFilterGroupWithoutIdSchema = createFilterGroupSchema(requestMethodsFilterWithoutIdSchema);

export const filterWithoutIdSchema = filterSchema.extend({
  urlFilter: z.array(urlOrRegexFilterWithoutIdSchema).optional().meta(filterSchema.shape.urlFilter.meta() ?? {}),
  regexFilter: z.array(urlOrRegexFilterWithoutIdSchema).optional().meta(filterSchema.shape.regexFilter.meta() ?? {}),
  initiatorDomains: domainsFilterWithoutIdSchema.optional().meta(filterSchema.shape.initiatorDomains.meta() ?? {}),
  excludedInitiatorDomains: domainsFilterWithoutIdSchema.optional().meta(filterSchema.shape.excludedInitiatorDomains.meta() ?? {}),
  requestDomains: domainsFilterWithoutIdSchema.optional().meta(filterSchema.shape.requestDomains.meta() ?? {}),
  excludedRequestDomains: domainsFilterWithoutIdSchema.optional().meta(filterSchema.shape.excludedRequestDomains.meta() ?? {}),
  topDomains: domainsFilterWithoutIdSchema.optional().meta(filterSchema.shape.topDomains.meta() ?? {}),
  excludedTopDomains: domainsFilterWithoutIdSchema.optional().meta(filterSchema.shape.excludedTopDomains.meta() ?? {}),
  resourceTypes: resourceTypesFilterGroupWithoutIdSchema.optional().meta(filterSchema.shape.resourceTypes.meta() ?? {}),
  excludedResourceTypes: resourceTypesFilterGroupWithoutIdSchema.optional().meta(filterSchema.shape.excludedResourceTypes.meta() ?? {}),
  requestMethods: requestMethodsFilterGroupWithoutIdSchema.optional().meta(filterSchema.shape.requestMethods.meta() ?? {}),
  excludedRequestMethods: requestMethodsFilterGroupWithoutIdSchema.optional().meta(filterSchema.shape.excludedRequestMethods.meta() ?? {}),
}).omit({ tabIds: true, excludedTabIds: true, tabGroups: true, excludedTabGroups: true }).meta(filterSchema.meta() ?? {});

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
  items: z.array(syncCookieWithoutIdSchema).meta(syncCookieGroupSchema.shape.items.meta() ?? {}),
});

const redirectUrlGroupItemWithoutIdSchema = redirectUrlGroupItemSchema.omit({ id: true }).meta(redirectUrlGroupItemSchema.meta() ?? {});

export const profileWithoutIdsZodSchema = profileSchema.omit({ groupId: true, id: true }).extend({
  requestHeaderModGroups: z.array(headerModGroupWithoutIdSchema).optional().meta(profileSchema.shape.requestHeaderModGroups.meta() ?? {}),
  responseHeaderModGroups: z.array(headerModGroupWithoutIdSchema).optional(),
  syncCookieGroups: z.array(syncCookieGroupWithoutIdSchema).optional().meta(profileSchema.shape.syncCookieGroups.meta() ?? {}),
  redirectUrlGroup: z.array(redirectUrlGroupItemWithoutIdSchema).optional().meta(profileSchema.shape.redirectUrlGroup.meta() ?? {}),
  filters: filterWithoutIdSchema,
}).meta({ description: "Portable profile. Internal IDs, group membership IDs and browser tab bindings are omitted. Imports generate fresh IDs; header values and comments are not redacted." });

/** Version 1 import format, retained for backward compatibility. */
export const profileExchangeLegacyV1Schema = z.object({
  version: z.literal(1),
  profiles: z.array(profileWithoutIdsZodSchema).min(1),
});

const exchangeGroupSchema = z.object({
  kind: z.literal("group"),
  ...profileGroupSchema.pick({ name: true, color: true, type: true }).shape,
  profiles: z.array(profileWithoutIdsZodSchema).min(1).meta({ description: "Nonempty ordered group members. Radio groups must have at most one enabled profile; Headerly checks this on import." }),
}).meta({ description: "Portable profile group. Import creates a new group and restores membership; local pause history is not included." });

const exchangeItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("profile"), profile: profileWithoutIdsZodSchema }),
  exchangeGroupSchema,
]);

/** Always defines the latest export format; update this schema when the format evolves. */
export const profileExchangeLatestSchema = z.object({
  version: z.literal(PROFILE_IMPORT_SCHEMA_VERSION),
  items: z.array(exchangeItemSchema).min(1).meta({ description: "Nonempty list of standalone profiles and groups in sidebar order. Group members retain their order." }),
}).superRefine((exchange, ctx) => {
  exchange.items.forEach((item, index) => {
    if (item.kind !== "group")
      return;
    if (item.type === "radio" && item.profiles.filter(profile => profile.enabled).length > 1) {
      ctx.addIssue({ code: "custom", path: ["items", index, "profiles"], message: "A radio group can have at most one enabled profile" });
    }
  });
}).meta({
  description: "Latest Headerly profile exchange document for import, export and sharing. Imports create new profiles and groups without replacing same-named items. Chrome validates browser-specific rule constraints when registering rules.",

});

/** Published JSON Schema describes only the latest exchange format. */
export const profileExchangeJsonSchema = z.toJSONSchema(profileExchangeLatestSchema);

export const profileExchangeZodSchema = z.discriminatedUnion("version", [profileExchangeLegacyV1Schema, profileExchangeLatestSchema]);
/** JSON Schema for editor validation of every supported import format. */
export const profileExchangeEditorJsonSchema = z.toJSONSchema(profileExchangeZodSchema);

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
  return profileExchangeLatestSchema.parse({ version: PROFILE_IMPORT_SCHEMA_VERSION, items });
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
