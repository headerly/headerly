import type { GroupType } from "../schema";
import { describe, expect, it } from "vitest";
import { createProfileExchange, profileExchangeEditorJsonSchema, profileExchangeZodSchema } from "../schema";
import { mockProfile } from "./schema.fixtures";

const profile = { name: "Test", emoji: "", enabled: false, ruleActionType: "modifyHeaders", filters: {} };
const cases = [
  ...["requestHeaderModGroups", "responseHeaderModGroups"].map(field => ({
    field,
    makeProfile: (type: GroupType, states: boolean[]) => ({ ...profile, [field]: [{ type, items: states.map(enabled => ({ enabled, operation: "set", name: "x-test", value: "test" })) }] }),
  })),
  {
    field: "syncCookieGroups",
    makeProfile: (type: GroupType, states: boolean[]) => ({ ...profile, syncCookieGroups: [{ type, items: states.map(enabled => ({ enabled, domain: "example.com", name: "session", path: "/", value: "" })) }] }),
  },
  ...["initiatorDomains", "excludedInitiatorDomains", "requestDomains", "excludedRequestDomains", "topDomains", "excludedTopDomains", "resourceTypes", "excludedResourceTypes", "requestMethods", "excludedRequestMethods"].map(field => ({
    field: `filters.${field}`,
    makeProfile: (type: GroupType, states: boolean[]) => {
      let value: string | string[] = "example.com";
      if (field.endsWith("ResourceTypes") || field === "resourceTypes")
        value = ["script"];
      if (field.endsWith("RequestMethods") || field === "requestMethods")
        value = ["get"];
      return { ...profile, filters: { [field]: { type, items: states.map(enabled => ({ enabled, value })) } } };
    },
  })),
];

function exchange(version: number, member: unknown) {
  return version === 1 ? { version, profiles: [member] } : { version, items: [{ kind: "profile", profile: member }] };
}

describe.each([1, 2])("group constraints in exchange version %i", (version) => {
  it.each(cases)("validates $field", ({ makeProfile }) => {
    for (const type of ["radio", "checkbox"] as const) {
      expect(profileExchangeZodSchema.safeParse(exchange(version, makeProfile(type, []))).success).toBe(false);
      for (const states of [[false], [true], [false, false], [false, true]]) {
        expect(profileExchangeZodSchema.safeParse(exchange(version, makeProfile(type, states))).success).toBe(true);
      }
    }
    expect(profileExchangeZodSchema.safeParse(exchange(version, makeProfile("radio", [true, true]))).success).toBe(false);
    expect(profileExchangeZodSchema.safeParse(exchange(version, makeProfile("checkbox", [true, true]))).success).toBe(true);
  });

  it("allows omitted groups and empty ordinary arrays", () => {
    expect(profileExchangeZodSchema.safeParse(exchange(version, {
      ...profile,
      requestHeaderModGroups: [],
      responseHeaderModGroups: [],
      syncCookieGroups: [],
      redirectUrlGroup: [],
      filters: { urlFilter: [], regexFilter: [], resourceTypes: { type: "checkbox", items: [{ enabled: false, value: [] }] } },
    })).success).toBe(true);
  });
});

it.each(["radio", "checkbox"] as const)("requires at least one profile in a top-level %s group", (type) => {
  const group = { kind: "group", name: "Group", color: "#000", type, profiles: [] };
  const result = profileExchangeZodSchema.safeParse({ version: 2, items: [group] });
  expect(result.success).toBe(false);
  if (!result.success)
    expect(result.error.issues).toEqual([expect.objectContaining({ path: ["items", 0, "profiles"] })]);
  expect(profileExchangeZodSchema.safeParse({ version: 2, items: [{ ...group, profiles: [profile] }] }).success).toBe(true);
});

it("reports invalid nested groups together with their parent group", () => {
  const member = { ...profile, enabled: true, requestHeaderModGroups: [{ type: "checkbox", items: [] }], filters: { requestDomains: { type: "radio", items: [{ enabled: true, value: "a.com" }, { enabled: true, value: "b.com" }] } } };
  const result = profileExchangeZodSchema.safeParse({ version: 2, items: [{ kind: "group", name: "Group", color: "#000", type: "radio", profiles: [member, { ...profile, enabled: true }] }] });
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues.map(issue => issue.path)).toEqual([
      ["items", 0, "profiles"],
      ["items", 0, "profiles", 0, "requestHeaderModGroups", 0, "items"],
      ["items", 0, "profiles", 0, "filters", "requestDomains", "items"],
    ]);
  }
});

it("keeps unfinished local groups visible in the export preview for diagnostics", () => {
  const exported = createProfileExchange([{ ...mockProfile, requestHeaderModGroups: [{ ...mockProfile.requestHeaderModGroups![0]!, items: [] }] }]);
  expect(exported.items).toHaveLength(1);
  expect(profileExchangeZodSchema.safeParse(exported).success).toBe(false);
});

it("includes nonempty arrays and zero-or-one enabled constraints in the generated JSON Schema", () => {
  let groupsChecked = 0;
  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value !== "object" || value === null)
      return;
    const record = value as Record<string, any>;
    if (record.properties?.type?.enum?.includes("radio")) {
      const key = record.properties.profiles ? "profiles" : "items";
      expect(record.properties[key].minItems).toBe(1);
      expect(record.allOf).toEqual([{
        if: { properties: { type: { const: "radio" } }, required: ["type"] },
        then: { properties: { [key]: { contains: { type: "object", properties: { enabled: { const: true } }, required: ["enabled"] }, minContains: 0, maxContains: 1 } } },
      }]);
      groupsChecked++;
    }
    Object.values(record).forEach(visit);
  }
  visit(profileExchangeEditorJsonSchema);
  expect(groupsChecked).toBeGreaterThanOrEqual(cases.length * 2 + 1);
});
