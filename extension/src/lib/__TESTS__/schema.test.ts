import type { Profile } from "../schema";
import { describe, expect, it } from "vitest";
import {
  addProfileIds,

  profileWithoutIdsZodSchema,
  stripProfileIds,
} from "../schema";

describe("profile ID Management", () => {
  const mockProfile: Profile = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Test Profile",
    enabled: true,
    emoji: "🔒",
    comments: "Test profile for unit tests",
    priority: 5,
    requestHeaderModGroups: [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        type: "checkbox",
        items: [
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            enabled: true,
            comments: "Test header mod",
            name: "X-Custom-Header",
            operation: "set",
            value: "test-value",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            enabled: true,
            comments: "Remove header",
            name: "X-Remove-Header",
            operation: "remove",
          },
        ],
      },
    ],
    responseHeaderModGroups: [
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        type: "radio",
        items: [
          {
            id: "550e8400-e29b-41d4-a716-446655440005",
            enabled: true,
            comments: "Response header mod",
            name: "X-Response-Header",
            operation: "append",
            value: "response-value",
          },
        ],
      },
    ],
    syncCookieGroups: [
      {
        id: "550e8400-e29b-41d4-a716-446655440006",
        type: "checkbox",
        items: [
          {
            id: "550e8400-e29b-41d4-a716-446655440007",
            enabled: true,
            comments: "Test cookie",
            domain: "example.com",
            name: "test-cookie",
            value: "cookie-value",
            path: "/",
          },
        ],
      },
    ],
    filters: {
      urlFilter: [
        {
          id: "550e8400-e29b-41d4-a716-446655440008",
          enabled: true,
          comments: "URL filter",
          value: "https://example.com/*",
        },
      ],
      regexFilter: [
        {
          id: "550e8400-e29b-41d4-a716-446655440009",
          enabled: true,
          comments: "Regex filter",
          value: ".*\\.example\\.com.*",
        },
      ],
      initiatorDomains: {
        type: "checkbox",
        items: [
          {
            id: "550e8400-e29b-41d4-a716-446655440010",
            enabled: true,
            comments: "Initiator domain",
            value: "example.com",
          },
        ],
      },
      excludedInitiatorDomains: {
        type: "radio",
        items: [
          {
            id: "550e8400-e29b-41d4-a716-446655440011",
            enabled: true,
            comments: "Excluded initiator domain",
            value: "bad-site.com",
          },
        ],
      },
      requestDomains: {
        type: "checkbox",
        items: [
          {
            id: "550e8400-e29b-41d4-a716-446655440012",
            enabled: true,
            comments: "Request domain",
            value: "api.example.com",
          },
        ],
      },
      excludedRequestDomains: {
        type: "radio",
        items: [
          {
            id: "550e8400-e29b-41d4-a716-446655440013",
            enabled: true,
            comments: "Excluded request domain",
            value: "malicious.com",
          },
        ],
      },
      resourceTypes: [
        {
          id: "550e8400-e29b-41d4-a716-446655440014",
          enabled: true,
          comments: "Resource types filter",
          value: ["script", "stylesheet"],
        },
      ],
      excludedResourceTypes: [
        {
          id: "550e8400-e29b-41d4-a716-446655440015",
          enabled: true,
          comments: "Excluded resource types",
          value: ["image", "font"],
        },
      ],
      requestMethods: [
        {
          id: "550e8400-e29b-41d4-a716-446655440016",
          enabled: true,
          comments: "Request methods filter",
          value: ["get", "post"],
        },
      ],
      excludedRequestMethods: [
        {
          id: "550e8400-e29b-41d4-a716-446655440017",
          enabled: true,
          comments: "Excluded request methods",
          value: ["delete", "patch"],
        },
      ],
      domainType: {
        enabled: true,
        value: "firstParty",
      },
      isUrlFilterCaseSensitive: {
        enabled: false,
        value: true,
      },
    },
  };

  describe("stripProfileIds", () => {
    it("should remove all id fields from profile", () => {
      const result = stripProfileIds(mockProfile);

      // Check that main profile id is removed
      expect(result).not.toHaveProperty("id");

      // Check that the result matches ProfileWithoutIds schema
      expect(() => profileWithoutIdsZodSchema.parse(result)).not.toThrow();

      // Check that basic fields are preserved
      expect(result.name).toBe(mockProfile.name);
      expect(result.enabled).toBe(mockProfile.enabled);
      expect(result.emoji).toBe(mockProfile.emoji);
      expect(result.comments).toBe(mockProfile.comments);
      expect(result.priority).toBe(mockProfile.priority);
    });

    it("should remove id fields from nested structures", () => {
      const result = stripProfileIds(mockProfile);

      // Check header mod groups
      expect(result.requestHeaderModGroups[0]).not.toHaveProperty("id");
      expect(result.requestHeaderModGroups[0]!.items[0]).not.toHaveProperty("id");
      expect(result.requestHeaderModGroups[0]!.items[1]).not.toHaveProperty("id");

      // Check response header mod groups
      expect(result.responseHeaderModGroups[0]).not.toHaveProperty("id");
      expect(result.responseHeaderModGroups[0]!.items[0]).not.toHaveProperty("id");

      // Check sync cookie groups
      expect(result.syncCookieGroups[0]).not.toHaveProperty("id");
      expect(result.syncCookieGroups[0]!.items[0]).not.toHaveProperty("id");

      // Check filters - all id fields should be removed
      expect(result.filters.urlFilter?.[0]).not.toHaveProperty("id");
      expect(result.filters.regexFilter?.[0]).not.toHaveProperty("id");
      expect(result.filters.initiatorDomains?.items[0]).not.toHaveProperty("id");
      expect(result.filters.excludedInitiatorDomains?.items[0]).not.toHaveProperty("id");
      expect(result.filters.requestDomains?.items[0]).not.toHaveProperty("id");
      expect(result.filters.excludedRequestDomains?.items[0]).not.toHaveProperty("id");
      expect(result.filters.resourceTypes?.[0]).not.toHaveProperty("id");
      expect(result.filters.excludedResourceTypes?.[0]).not.toHaveProperty("id");
      expect(result.filters.requestMethods?.[0]).not.toHaveProperty("id");
      expect(result.filters.excludedRequestMethods?.[0]).not.toHaveProperty("id");

      // Check that fields without ids are still present
      expect(result.filters.domainType).toBeDefined();
      expect(result.filters.isUrlFilterCaseSensitive).toBeDefined();
    });

    it("should preserve non-id fields in nested structures", () => {
      const result = stripProfileIds(mockProfile);

      // Check that non-id fields are preserved
      expect(result.requestHeaderModGroups[0]!.type).toBe("checkbox");
      expect(result.requestHeaderModGroups[0]!.items[0]!.name).toBe("X-Custom-Header");
      expect(result.requestHeaderModGroups[0]!.items[0]!.operation).toBe("set");
      if (result.requestHeaderModGroups[0]!.items[0]!.operation !== "remove") {
        expect(result.requestHeaderModGroups[0]!.items[0]!.value).toBe("test-value");
      }

      expect(result.syncCookieGroups[0]!.items[0]!.domain).toBe("example.com");
      expect(result.syncCookieGroups[0]!.items[0]!.name).toBe("test-cookie");

      // Check all filter fields are preserved (except ids)
      expect(result.filters.urlFilter![0]!.value).toBe("https://example.com/*");
      expect(result.filters.regexFilter![0]!.value).toBe(".*\\.example\\.com.*");
      expect(result.filters.initiatorDomains!.items[0]!.value).toBe("example.com");
      expect(result.filters.excludedInitiatorDomains!.items[0]!.value).toBe("bad-site.com");
      expect(result.filters.requestDomains!.items[0]!.value).toBe("api.example.com");
      expect(result.filters.excludedRequestDomains!.items[0]!.value).toBe("malicious.com");
      expect(result.filters.resourceTypes![0]!.value).toEqual(["script", "stylesheet"]);
      expect(result.filters.excludedResourceTypes![0]!.value).toEqual(["image", "font"]);
      expect(result.filters.requestMethods![0]!.value).toEqual(["get", "post"]);
      expect(result.filters.excludedRequestMethods![0]!.value).toEqual(["delete", "patch"]);
      expect(result.filters.domainType!.value).toBe("firstParty");
      expect(result.filters.isUrlFilterCaseSensitive!.value).toBe(true);
    });
  });

  describe("addProfileIds", () => {
    it("should add id fields to profile without ids", () => {
      const profileWithoutIds = stripProfileIds(mockProfile);
      const result = addProfileIds(profileWithoutIds);

      // Check that main profile has id
      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("string");
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      // Check that basic fields are preserved
      expect(result.name).toBe(profileWithoutIds.name);
      expect(result.enabled).toBe(profileWithoutIds.enabled);
      expect(result.emoji).toBe(profileWithoutIds.emoji);
    });

    it("should add id fields to nested structures", () => {
      const profileWithoutIds = stripProfileIds(mockProfile);
      const result = addProfileIds(profileWithoutIds);

      // Check header mod groups have new ids
      expect(result.requestHeaderModGroups[0]).toHaveProperty("id");
      expect(result.requestHeaderModGroups[0]!.items[0]).toHaveProperty("id");
      expect(result.requestHeaderModGroups[0]!.items[1]).toHaveProperty("id");

      // Check response header mod groups have new ids
      expect(result.responseHeaderModGroups[0]).toHaveProperty("id");
      expect(result.responseHeaderModGroups[0]!.items[0]).toHaveProperty("id");

      // Check sync cookie groups have new ids
      expect(result.syncCookieGroups[0]).toHaveProperty("id");
      expect(result.syncCookieGroups[0]!.items[0]).toHaveProperty("id");

      // Check filters - all items that should have ids now have them
      expect(result.filters.urlFilter![0]).toHaveProperty("id");
      expect(result.filters.regexFilter![0]).toHaveProperty("id");
      expect(result.filters.initiatorDomains!.items[0]).toHaveProperty("id");
      expect(result.filters.excludedInitiatorDomains!.items[0]).toHaveProperty("id");
      expect(result.filters.requestDomains!.items[0]).toHaveProperty("id");
      expect(result.filters.excludedRequestDomains!.items[0]).toHaveProperty("id");
      expect(result.filters.resourceTypes![0]).toHaveProperty("id");
      expect(result.filters.excludedResourceTypes![0]).toHaveProperty("id");
      expect(result.filters.requestMethods![0]).toHaveProperty("id");
      expect(result.filters.excludedRequestMethods![0]).toHaveProperty("id");

      // Verify all ids are valid UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(result.requestHeaderModGroups[0]!.id).toMatch(uuidRegex);
      expect(result.requestHeaderModGroups[0]!.items[0]!.id).toMatch(uuidRegex);
      expect(result.filters.urlFilter![0]!.id).toMatch(uuidRegex);
      expect(result.filters.regexFilter![0]!.id).toMatch(uuidRegex);
      expect(result.filters.initiatorDomains!.items[0]!.id).toMatch(uuidRegex);
      expect(result.filters.resourceTypes![0]!.id).toMatch(uuidRegex);
      expect(result.filters.requestMethods![0]!.id).toMatch(uuidRegex);
    });

    it("should generate different ids from original", () => {
      const profileWithoutIds = stripProfileIds(mockProfile);
      const result = addProfileIds(profileWithoutIds);

      // New ids should be different from original
      expect(result.id).not.toBe(mockProfile.id);
      expect(result.requestHeaderModGroups[0]!.id).not.toBe(mockProfile.requestHeaderModGroups[0]!.id);
      expect(result.requestHeaderModGroups[0]!.items[0]!.id).not.toBe(mockProfile.requestHeaderModGroups[0]!.items[0]!.id);
    });
  });

  describe("filters field comprehensive tests", () => {
    it("should handle all filter field types correctly", () => {
      const result = stripProfileIds(mockProfile);

      // Verify structure is maintained
      expect(result.filters).toBeDefined();
      expect(result.filters.urlFilter).toHaveLength(1);
      expect(result.filters.regexFilter).toHaveLength(1);
      expect(result.filters.initiatorDomains?.items).toHaveLength(1);
      expect(result.filters.excludedInitiatorDomains?.items).toHaveLength(1);
      expect(result.filters.requestDomains?.items).toHaveLength(1);
      expect(result.filters.excludedRequestDomains?.items).toHaveLength(1);
      expect(result.filters.resourceTypes).toHaveLength(1);
      expect(result.filters.excludedResourceTypes).toHaveLength(1);
      expect(result.filters.requestMethods).toHaveLength(1);
      expect(result.filters.excludedRequestMethods).toHaveLength(1);

      // Verify all complex values are preserved correctly
      expect(result.filters.resourceTypes![0]!.value).toEqual(["script", "stylesheet"]);
      expect(result.filters.requestMethods![0]!.value).toEqual(["get", "post"]);
      expect(result.filters.initiatorDomains!.type).toBe("checkbox");
      expect(result.filters.excludedInitiatorDomains!.type).toBe("radio");
    });

    it("should preserve filter field data through round trip", () => {
      const stripped = stripProfileIds(mockProfile);
      const restored = addProfileIds(stripped);

      // Compare all filter values
      expect(restored.filters.urlFilter![0]!.value).toBe(mockProfile.filters.urlFilter![0]!.value);
      expect(restored.filters.regexFilter![0]!.value).toBe(mockProfile.filters.regexFilter![0]!.value);
      expect(restored.filters.initiatorDomains!.items[0]!.value).toBe(mockProfile.filters.initiatorDomains!.items[0]!.value);
      expect(restored.filters.excludedInitiatorDomains!.items[0]!.value).toBe(mockProfile.filters.excludedInitiatorDomains!.items[0]!.value);
      expect(restored.filters.requestDomains!.items[0]!.value).toBe(mockProfile.filters.requestDomains!.items[0]!.value);
      expect(restored.filters.excludedRequestDomains!.items[0]!.value).toBe(mockProfile.filters.excludedRequestDomains!.items[0]!.value);
      expect(restored.filters.resourceTypes![0]!.value).toEqual(mockProfile.filters.resourceTypes![0]!.value);
      expect(restored.filters.excludedResourceTypes![0]!.value).toEqual(mockProfile.filters.excludedResourceTypes![0]!.value);
      expect(restored.filters.requestMethods![0]!.value).toEqual(mockProfile.filters.requestMethods![0]!.value);
      expect(restored.filters.excludedRequestMethods![0]!.value).toEqual(mockProfile.filters.excludedRequestMethods![0]!.value);
      expect(restored.filters.domainType!.value).toBe(mockProfile.filters.domainType!.value);
      expect(restored.filters.isUrlFilterCaseSensitive!.value).toBe(mockProfile.filters.isUrlFilterCaseSensitive!.value);

      // Verify all ids are different but structure is intact
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
  it("should preserve all non-id data through strip and add cycle", () => {
    const strippedProfile = stripProfileIds(mockProfile);
    const restoredProfile = addProfileIds(strippedProfile);

    // Compare non-id fields
    expect(restoredProfile.name).toBe(mockProfile.name);
    expect(restoredProfile.enabled).toBe(mockProfile.enabled);
    expect(restoredProfile.emoji).toBe(mockProfile.emoji);
    expect(restoredProfile.comments).toBe(mockProfile.comments);
    expect(restoredProfile.priority).toBe(mockProfile.priority);

    // Compare nested structures (excluding ids)
    expect(restoredProfile.requestHeaderModGroups[0]!.type).toBe(mockProfile.requestHeaderModGroups[0]!.type);
    expect(restoredProfile.requestHeaderModGroups[0]!.items[0]!.name).toBe(mockProfile.requestHeaderModGroups[0]!.items[0]!.name);
    expect(restoredProfile.requestHeaderModGroups[0]!.items[0]!.operation).toBe(mockProfile.requestHeaderModGroups[0]!.items[0]!.operation);

    expect(restoredProfile.syncCookieGroups[0]!.items[0]!.domain).toBe(mockProfile.syncCookieGroups[0]!.items[0]!.domain);
    expect(restoredProfile.syncCookieGroups[0]!.items[0]!.name).toBe(mockProfile.syncCookieGroups[0]!.items[0]!.name);
  });

  it("should handle multiple round trips", () => {
    let currentProfile = mockProfile;

    // Do multiple round trips
    for (let i = 0; i < 3; i++) {
      const stripped = stripProfileIds(currentProfile);
      currentProfile = addProfileIds(stripped);
    }

    // Data should remain consistent
    expect(currentProfile.name).toBe(mockProfile.name);
    expect(currentProfile.requestHeaderModGroups[0]!.items[0]!.name).toBe(mockProfile.requestHeaderModGroups[0]!.items[0]!.name);

    // But ids should be different
    expect(currentProfile.id).not.toBe(mockProfile.id);
  });
});

describe("edge cases", () => {
  it("should handle profile with empty arrays", () => {
    const emptyProfile: Profile = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Empty Profile",
      enabled: false,
      emoji: "📝",
      comments: "Empty profile",
      requestHeaderModGroups: [],
      responseHeaderModGroups: [],
      syncCookieGroups: [],
      filters: {},
    };

    const stripped = stripProfileIds(emptyProfile);
    const restored = addProfileIds(stripped);

    expect(stripped).not.toHaveProperty("id");
    expect(restored).toHaveProperty("id");
    expect(restored.requestHeaderModGroups).toEqual([]);
    expect(restored.responseHeaderModGroups).toEqual([]);
    expect(restored.syncCookieGroups).toEqual([]);
  });

  it("should handle profile with minimal data", () => {
    const minimalProfile: Profile = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Minimal Profile",
      enabled: true,
      emoji: "⚡",
      comments: "",
      requestHeaderModGroups: [],
      responseHeaderModGroups: [],
      syncCookieGroups: [],
      filters: {},
    };

    expect(() => {
      const stripped = stripProfileIds(minimalProfile);
      const restored = addProfileIds(stripped);
      expect(restored.name).toBe("Minimal Profile");
    }).not.toThrow();
  });
});
