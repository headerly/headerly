import type { Profile } from "../schema";
import { describe, expect, it } from "vitest";
import { addProfileIds, stripProfileIds } from "../schema";
import { mockProfile } from "./schema.fixtures";

describe("filters field comprehensive tests", () => {
  it("should handle all filter field types correctly", () => {
    const result = stripProfileIds(mockProfile);

    expect(result.filters).toBeDefined();
    expect(result.filters.urlFilter).toHaveLength(1);
    expect(result.filters.regexFilter).toHaveLength(1);
    expect(result.filters.initiatorDomains?.items).toHaveLength(1);
    expect(result.filters.excludedInitiatorDomains?.items).toHaveLength(1);
    expect(result.filters.requestDomains?.items).toHaveLength(1);
    expect(result.filters.excludedRequestDomains?.items).toHaveLength(1);
    expect(result.filters.topDomains?.items).toHaveLength(1);
    expect(result.filters.excludedTopDomains?.items).toHaveLength(1);
    expect(result.filters.resourceTypes).toHaveLength(1);
    expect(result.filters.excludedResourceTypes).toHaveLength(1);
    expect(result.filters.requestMethods).toHaveLength(1);
    expect(result.filters.excludedRequestMethods).toHaveLength(1);
    expect(result.filters.resourceTypes![0]!.value).toEqual(["script", "stylesheet"]);
    expect(result.filters.requestMethods![0]!.value).toEqual(["get", "post"]);
    expect(result.filters.initiatorDomains!.type).toBe("checkbox");
    expect(result.filters.excludedInitiatorDomains!.type).toBe("radio");
  });

  it("should preserve filter field data through round trip", () => {
    const restored = addProfileIds(stripProfileIds(mockProfile));

    expect(restored.filters.urlFilter![0]!.value).toBe(mockProfile.filters.urlFilter![0]!.value);
    expect(restored.filters.regexFilter![0]!.value).toBe(mockProfile.filters.regexFilter![0]!.value);
    expect(restored.filters.initiatorDomains!.items[0]!.value).toBe(mockProfile.filters.initiatorDomains!.items[0]!.value);
    expect(restored.filters.excludedInitiatorDomains!.items[0]!.value).toBe(mockProfile.filters.excludedInitiatorDomains!.items[0]!.value);
    expect(restored.filters.requestDomains!.items[0]!.value).toBe(mockProfile.filters.requestDomains!.items[0]!.value);
    expect(restored.filters.excludedRequestDomains!.items[0]!.value).toBe(mockProfile.filters.excludedRequestDomains!.items[0]!.value);
    expect(restored.filters.topDomains!.items[0]!.value).toBe(mockProfile.filters.topDomains!.items[0]!.value);
    expect(restored.filters.excludedTopDomains!.items[0]!.value).toBe(mockProfile.filters.excludedTopDomains!.items[0]!.value);
    expect(restored.filters.resourceTypes![0]!.value).toEqual(mockProfile.filters.resourceTypes![0]!.value);
    expect(restored.filters.excludedResourceTypes![0]!.value).toEqual(mockProfile.filters.excludedResourceTypes![0]!.value);
    expect(restored.filters.requestMethods![0]!.value).toEqual(mockProfile.filters.requestMethods![0]!.value);
    expect(restored.filters.excludedRequestMethods![0]!.value).toEqual(mockProfile.filters.excludedRequestMethods![0]!.value);
    expect(restored.filters.domainType!.value).toBe(mockProfile.filters.domainType!.value);
    expect(restored.filters.isUrlFilterCaseSensitive!.value).toBe(mockProfile.filters.isUrlFilterCaseSensitive!.value);
    expect(restored.filters.urlFilter![0]!.id).not.toBe(mockProfile.filters.urlFilter![0]!.id);
    expect(restored.filters.regexFilter![0]!.id).not.toBe(mockProfile.filters.regexFilter![0]!.id);
    expect(restored.filters.initiatorDomains!.items[0]!.id).not.toBe(mockProfile.filters.initiatorDomains!.items[0]!.id);
    expect(restored.filters.resourceTypes![0]!.id).not.toBe(mockProfile.filters.resourceTypes![0]!.id);
  });

  it("should handle empty filter arrays correctly", () => {
    const profileWithEmptyFilters: Profile = {
      ...mockProfile,
      filters: {
        urlFilter: [],
        regexFilter: [],
        resourceTypes: [],
        excludedResourceTypes: [],
        requestMethods: [],
        excludedRequestMethods: [],
      },
    };

    const stripped = stripProfileIds(profileWithEmptyFilters);
    const restored = addProfileIds(stripped);

    expect(stripped.filters.urlFilter).toEqual([]);
    expect(restored.filters.urlFilter).toEqual([]);
    expect(stripped.filters.regexFilter).toEqual([]);
    expect(restored.filters.regexFilter).toEqual([]);
    expect(stripped.filters.resourceTypes).toEqual([]);
    expect(restored.filters.resourceTypes).toEqual([]);
  });
});

describe("profile ID round trips", () => {
  it("should preserve all non-id data through strip and add cycle", () => {
    const restoredProfile = addProfileIds(stripProfileIds(mockProfile));

    expect(restoredProfile.name).toBe(mockProfile.name);
    expect(restoredProfile.enabled).toBe(mockProfile.enabled);
    expect(restoredProfile.emoji).toBe(mockProfile.emoji);
    expect(restoredProfile.comments).toBe(mockProfile.comments);
    expect(restoredProfile.priority).toBe(mockProfile.priority);
    expect(restoredProfile.requestHeaderModGroups![0]!.type).toBe(mockProfile.requestHeaderModGroups![0]!.type);
    expect(restoredProfile.requestHeaderModGroups![0]!.items[0]!.name).toBe(mockProfile.requestHeaderModGroups![0]!.items[0]!.name);
    expect(restoredProfile.requestHeaderModGroups![0]!.items[0]!.operation).toBe(mockProfile.requestHeaderModGroups![0]!.items[0]!.operation);
    expect(restoredProfile.syncCookieGroups![0]!.items[0]!.domain).toBe(mockProfile.syncCookieGroups![0]!.items[0]!.domain);
    expect(restoredProfile.syncCookieGroups![0]!.items[0]!.name).toBe(mockProfile.syncCookieGroups![0]!.items[0]!.name);
    expect(restoredProfile.redirectUrlGroup![0]!.value).toBe(mockProfile.redirectUrlGroup![0]!.value);
  });

  it("should handle multiple round trips", () => {
    let currentProfile = mockProfile;

    for (let i = 0; i < 3; i++) {
      currentProfile = addProfileIds(stripProfileIds(currentProfile));
    }

    expect(currentProfile.name).toBe(mockProfile.name);
    expect(currentProfile.requestHeaderModGroups![0]!.items[0]!.name).toBe(mockProfile.requestHeaderModGroups![0]!.items[0]!.name);
    expect(currentProfile.id).not.toBe(mockProfile.id);
  });
});

describe("edge cases", () => {
  it("should handle profile with empty arrays", () => {
    const emptyProfile: Profile = {
      ruleScope: "dynamic",
      ruleActionType: "modifyHeaders",
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Empty Profile",
      enabled: false,
      emoji: "📝",
      comments: "Empty profile",
      requestHeaderModGroups: [],
      responseHeaderModGroups: [],
      syncCookieGroups: [],
      redirectUrlGroup: [],
      filters: {},
    };

    const stripped = stripProfileIds(emptyProfile);
    const restored = addProfileIds(stripped);

    expect(stripped).not.toHaveProperty("id");
    expect(restored).toHaveProperty("id");
    expect(restored.requestHeaderModGroups).toEqual([]);
    expect(restored.responseHeaderModGroups).toEqual([]);
    expect(restored.syncCookieGroups).toEqual([]);
    expect(restored.redirectUrlGroup).toEqual([]);
  });

  it("should handle profile with minimal data", () => {
    const minimalProfile: Profile = {
      ruleScope: "dynamic",
      ruleActionType: "modifyHeaders",
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Minimal Profile",
      enabled: true,
      emoji: "⚡",
      requestHeaderModGroups: [],
      responseHeaderModGroups: [],
      syncCookieGroups: [],
      redirectUrlGroup: [],
      filters: {},
    };

    expect(() => {
      const restored = addProfileIds(stripProfileIds(minimalProfile));
      expect(restored.name).toBe("Minimal Profile");
    }).not.toThrow();
  });
});
