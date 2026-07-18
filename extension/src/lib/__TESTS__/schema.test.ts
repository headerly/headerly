import type { DOMAIN_TYPES, REQUEST_METHODS, RESOURCE_TYPES, RULE_ACTION_TYPES } from "../schema";
import { describe, expect, expectTypeOf, it } from "vitest";
import { PROFILE_IMPORT_SCHEMA_VERSION } from "../const";
import {
  addProfileIds,
  createProfileExchange,
  profileExchangeZodSchema,
  profileWithoutIdsZodSchema,
  stripProfileIds,
} from "../schema";
import { mockProfile } from "./schema.fixtures";

describe("schema enum constants", () => {
  it("matches Browser.declarativeNetRequest.ResourceType", () => {
    expectTypeOf<typeof RESOURCE_TYPES[number]>().toEqualTypeOf<`${Browser.declarativeNetRequest.ResourceType}`>();
  });

  it("matches Browser.declarativeNetRequest.RequestMethod", () => {
    expectTypeOf<typeof REQUEST_METHODS[number]>().toEqualTypeOf<`${Browser.declarativeNetRequest.RequestMethod}`>();
  });

  it("matches Browser.declarativeNetRequest.RuleActionType", () => {
    expectTypeOf<typeof RULE_ACTION_TYPES[number]>().toEqualTypeOf<`${Browser.declarativeNetRequest.RuleActionType}`>();
  });

  it("matches Browser.declarativeNetRequest.DomainType", () => {
    expectTypeOf<typeof DOMAIN_TYPES[number]>().toEqualTypeOf<`${Browser.declarativeNetRequest.DomainType}`>();
  });
});

describe("stripProfileIds", () => {
  it("should remove all id fields from profile", () => {
    const result = stripProfileIds(mockProfile);

    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("groupId");
    expect(() => profileWithoutIdsZodSchema.parse(result)).not.toThrow();
    expect(result.name).toBe(mockProfile.name);
    expect(result.enabled).toBe(mockProfile.enabled);
    expect(result.emoji).toBe(mockProfile.emoji);
    expect(result.comments).toBe(mockProfile.comments);
    expect(result.priority).toBe(mockProfile.priority);
  });

  it("should remove id fields from nested structures", () => {
    const result = stripProfileIds(mockProfile);

    expect(result.requestHeaderModGroups![0]).not.toHaveProperty("id");
    expect(result.requestHeaderModGroups![0]!.items[0]).not.toHaveProperty("id");
    expect(result.requestHeaderModGroups![0]!.items[1]).not.toHaveProperty("id");
    expect(result.responseHeaderModGroups![0]).not.toHaveProperty("id");
    expect(result.responseHeaderModGroups![0]!.items[0]).not.toHaveProperty("id");
    expect(result.syncCookieGroups![0]).not.toHaveProperty("id");
    expect(result.syncCookieGroups![0]!.items[0]).not.toHaveProperty("id");
    expect(result.redirectUrlGroup![0]).not.toHaveProperty("id");
    expect(result.filters.urlFilter?.[0]).not.toHaveProperty("id");
    expect(result.filters.regexFilter?.[0]).not.toHaveProperty("id");
    expect(result.filters.initiatorDomains?.items[0]).not.toHaveProperty("id");
    expect(result.filters.excludedInitiatorDomains?.items[0]).not.toHaveProperty("id");
    expect(result.filters.requestDomains?.items[0]).not.toHaveProperty("id");
    expect(result.filters.excludedRequestDomains?.items[0]).not.toHaveProperty("id");
    expect(result.filters.topDomains?.items[0]).not.toHaveProperty("id");
    expect(result.filters.excludedTopDomains?.items[0]).not.toHaveProperty("id");
    expect(result.filters.resourceTypes?.[0]).not.toHaveProperty("id");
    expect(result.filters.excludedResourceTypes?.[0]).not.toHaveProperty("id");
    expect(result.filters.requestMethods?.[0]).not.toHaveProperty("id");
    expect(result.filters.excludedRequestMethods?.[0]).not.toHaveProperty("id");
    expect(result.filters.domainType).toBeDefined();
    expect(result.filters.isUrlFilterCaseSensitive).toBeDefined();
  });

  it("should preserve non-id fields in nested structures", () => {
    const result = stripProfileIds(mockProfile);

    expect(result.requestHeaderModGroups![0]!.type).toBe("checkbox");
    expect(result.requestHeaderModGroups![0]!.items[0]!.name).toBe("X-Custom-Header");
    expect(result.requestHeaderModGroups![0]!.items[0]!.operation).toBe("set");
    if (result.requestHeaderModGroups![0]!.items[0]!.operation !== "remove") {
      expect(result.requestHeaderModGroups![0]!.items[0]!.value).toBe("test-value");
    }
    expect(result.syncCookieGroups![0]!.items[0]!.domain).toBe("example.com");
    expect(result.syncCookieGroups![0]!.items[0]!.name).toBe("test-cookie");
    expect(result.redirectUrlGroup![0]!.value).toBe("https://redirect.example.com/");
    expect(result.filters.urlFilter![0]!.value).toBe("https://example.com/*");
    expect(result.filters.regexFilter![0]!.value).toBe(".*\\.example\\.com.*");
    expect(result.filters.initiatorDomains!.items[0]!.value).toBe("example.com");
    expect(result.filters.excludedInitiatorDomains!.items[0]!.value).toBe("bad-site.com");
    expect(result.filters.requestDomains!.items[0]!.value).toBe("api.example.com");
    expect(result.filters.excludedRequestDomains!.items[0]!.value).toBe("malicious.com");
    expect(result.filters.topDomains!.items[0]!.value).toBe("app.example.com");
    expect(result.filters.excludedTopDomains!.items[0]!.value).toBe("embed.example.com");
    expect(result.filters.resourceTypes![0]!.value).toEqual(["script", "stylesheet"]);
    expect(result.filters.excludedResourceTypes![0]!.value).toEqual(["image", "font"]);
    expect(result.filters.requestMethods![0]!.value).toEqual(["get", "post"]);
    expect(result.filters.excludedRequestMethods![0]!.value).toEqual(["delete", "patch"]);
    expect(result.filters.domainType!.value).toBe("firstParty");
    expect(result.filters.isUrlFilterCaseSensitive!.value).toBe(true);
  });
});

describe("profile import/export", () => {
  it("should export profiles with latest version outside profile data", () => {
    const result = createProfileExchange([mockProfile]);

    expect(result.version).toBe(PROFILE_IMPORT_SCHEMA_VERSION);
    expect(result.profiles).toHaveLength(1);
    expect(result.profiles[0]).not.toHaveProperty("id");
    expect(result.profiles[0]).not.toHaveProperty("version");
    expect(() => profileExchangeZodSchema.parse(result)).not.toThrow();
  });

  it("should reject export payloads with mismatched version", () => {
    const exported = createProfileExchange([mockProfile]);

    expect(profileExchangeZodSchema.safeParse({
      ...exported,
      version: PROFILE_IMPORT_SCHEMA_VERSION + 1,
    }).success).toBe(false);
  });

  it("should require the versioned export payload shape", () => {
    const exported = createProfileExchange([mockProfile]);

    expect(profileExchangeZodSchema.safeParse(exported).success).toBe(true);
    expect(profileExchangeZodSchema.safeParse(exported.profiles).success).toBe(false);
  });
});

describe("addProfileIds", () => {
  it("should add id fields to profile without ids", () => {
    const profileWithoutIds = stripProfileIds(mockProfile);
    const result = addProfileIds(profileWithoutIds);

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("string");
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(result.name).toBe(profileWithoutIds.name);
    expect(result.enabled).toBe(profileWithoutIds.enabled);
    expect(result.emoji).toBe(profileWithoutIds.emoji);
  });

  it("should add id fields to nested structures", () => {
    const result = addProfileIds(stripProfileIds(mockProfile));
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(result.requestHeaderModGroups![0]).toHaveProperty("id");
    expect(result.requestHeaderModGroups![0]!.items[0]).toHaveProperty("id");
    expect(result.requestHeaderModGroups![0]!.items[1]).toHaveProperty("id");
    expect(result.responseHeaderModGroups![0]).toHaveProperty("id");
    expect(result.responseHeaderModGroups![0]!.items[0]).toHaveProperty("id");
    expect(result.syncCookieGroups![0]).toHaveProperty("id");
    expect(result.syncCookieGroups![0]!.items[0]).toHaveProperty("id");
    expect(result.redirectUrlGroup![0]).toHaveProperty("id");
    expect(result.filters.urlFilter![0]).toHaveProperty("id");
    expect(result.filters.regexFilter![0]).toHaveProperty("id");
    expect(result.filters.initiatorDomains!.items[0]).toHaveProperty("id");
    expect(result.filters.excludedInitiatorDomains!.items[0]).toHaveProperty("id");
    expect(result.filters.requestDomains!.items[0]).toHaveProperty("id");
    expect(result.filters.excludedRequestDomains!.items[0]).toHaveProperty("id");
    expect(result.filters.topDomains!.items[0]).toHaveProperty("id");
    expect(result.filters.excludedTopDomains!.items[0]).toHaveProperty("id");
    expect(result.filters.resourceTypes![0]).toHaveProperty("id");
    expect(result.filters.excludedResourceTypes![0]).toHaveProperty("id");
    expect(result.filters.requestMethods![0]).toHaveProperty("id");
    expect(result.filters.excludedRequestMethods![0]).toHaveProperty("id");
    expect(result.requestHeaderModGroups![0]!.id).toMatch(uuidRegex);
    expect(result.requestHeaderModGroups![0]!.items[0]!.id).toMatch(uuidRegex);
    expect(result.filters.urlFilter![0]!.id).toMatch(uuidRegex);
    expect(result.filters.regexFilter![0]!.id).toMatch(uuidRegex);
    expect(result.filters.initiatorDomains!.items[0]!.id).toMatch(uuidRegex);
    expect(result.filters.resourceTypes![0]!.id).toMatch(uuidRegex);
    expect(result.filters.requestMethods![0]!.id).toMatch(uuidRegex);
    expect(result.redirectUrlGroup![0]!.id).toMatch(uuidRegex);
  });

  it("should generate different ids from original", () => {
    const result = addProfileIds(stripProfileIds(mockProfile));

    expect(result.id).not.toBe(mockProfile.id);
    expect(result.requestHeaderModGroups![0]!.id).not.toBe(mockProfile.requestHeaderModGroups![0]!.id);
    expect(result.requestHeaderModGroups![0]!.items[0]!.id).not.toBe(mockProfile.requestHeaderModGroups![0]!.items[0]!.id);
    expect(result.redirectUrlGroup![0]!.id).not.toBe(mockProfile.redirectUrlGroup![0]!.id);
  });
});
