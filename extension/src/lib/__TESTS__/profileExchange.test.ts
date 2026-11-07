import type { ProfileGroup } from "@headerly/schema";
import { createProfileExchange, profileExchangeEditorJsonSchema, profileExchangeZodSchema, restoreProfileExchange, stripProfileIds } from "@headerly/schema";
import { describe, expect, it } from "vitest";
import { mockProfile } from "./schema.fixtures";

const group: ProfileGroup = { id: mockProfile.groupId!, name: "Environment", color: "#8ab4f8", type: "checkbox", lastEnabledProfileIds: [mockProfile.id] };
const second = { ...mockProfile, id: "550e8400-e29b-41d4-a716-446655440088", name: "Second", enabled: false };
const standalone = { ...mockProfile, id: "550e8400-e29b-41d4-a716-446655440077", groupId: undefined };

describe("v2 profile exchange", () => {
  it("preserves sidebar ordering, group metadata, members and fresh IDs across repeated imports", () => {
    const exchange = createProfileExchange([standalone, mockProfile, second], [group]);
    expect(exchange.items.map(item => item.kind)).toEqual(["profile", "group"]);
    const firstImport = restoreProfileExchange(exchange);
    const nextImport = restoreProfileExchange(exchange);
    expect(firstImport.profileGroups[0]).toMatchObject({ name: group.name, color: group.color, type: group.type });
    expect(firstImport.profiles[0]!.groupId).toBeUndefined();
    expect(firstImport.profiles.slice(1).map(profile => profile.groupId)).toEqual([firstImport.profileGroups[0]!.id, firstImport.profileGroups[0]!.id]);
    expect(firstImport.profileGroups[0]!.id).not.toBe(group.id);
    expect(nextImport.profileGroups[0]!.id).not.toBe(firstImport.profileGroups[0]!.id);
    expect(nextImport.profiles[1]!.id).not.toBe(firstImport.profiles[1]!.id);
    expect(createProfileExchange(firstImport.profiles, firstImport.profileGroups)).toEqual(exchange);
  });

  it("retains the group even for a single selected member", () => {
    const exchange = createProfileExchange([mockProfile, standalone, second], [group], new Set([second.id, standalone.id]));
    expect(exchange.items.map(item => item.kind)).toEqual(["group", "profile"]);
    expect(exchange.items[0]).toMatchObject({ kind: "group", name: group.name, profiles: [{ name: second.name }] });
    const restored = restoreProfileExchange(exchange);
    expect(restored.profiles).toHaveLength(2);
    expect(restored.profiles[0]!.groupId).toBe(restored.profileGroups[0]!.id);
  });

  it("omits unselected groups and redacts cookie values without mutating the originals", () => {
    const original = structuredClone(mockProfile);
    const exchange = createProfileExchange([mockProfile, standalone], [group], new Set([standalone.id]));
    expect(exchange.items).toHaveLength(1);
    expect(exchange.items[0]!.kind).toBe("profile");
    const restored = restoreProfileExchange(exchange);
    expect(restored.profiles[0]!.syncCookieGroups![0]!.items[0]!.value).toBe("");
    expect(mockProfile).toEqual(original);
    expect(JSON.stringify(exchange)).not.toContain(mockProfile.id);
  });

  it("imports v1 as ungrouped profiles and supports both versions in JSON Schema", () => {
    const restored = restoreProfileExchange({ version: 1, profiles: [stripProfileIds(mockProfile)] });
    expect(restored.profileGroups).toEqual([]);
    expect(restored.profiles[0]!.groupId).toBeUndefined();
    expect(restored.profiles[0]!.id).not.toBe(mockProfile.id);
    expect(JSON.stringify(profileExchangeEditorJsonSchema)).toContain("\"const\":1");
    expect(JSON.stringify(profileExchangeEditorJsonSchema)).toContain("\"const\":2");
  });

  it.each(["radio", "checkbox"] as const)("keeps %s members disabled without exporting pause history", (type) => {
    const profiles = [mockProfile, second].map(profile => ({ ...profile, enabled: false }));
    const exchange = createProfileExchange(profiles, [{ ...group, type, lastEnabledProfileIds: [second.id] }]);
    const restored = restoreProfileExchange(exchange);
    expect(restored.profiles.every(profile => !profile.enabled)).toBe(true);
    expect(restored.profileGroups[0]).not.toHaveProperty("lastEnabledProfileIds");
    expect(JSON.stringify(exchange)).not.toContain("lastEnabledProfile");
    expect(JSON.stringify(exchange)).not.toContain("\"ref\"");
  });

  it("ignores obsolete pause history and references when importing existing v2 payloads", () => {
    const exchange = {
      version: 2,
      items: [{
        kind: "group",
        name: group.name,
        color: group.color,
        type: group.type,
        profiles: [{ ...stripProfileIds(mockProfile), ref: "p1" }],
        lastEnabledProfileRefs: ["p1"],
        lastEnabledProfileIds: [mockProfile.id],
      }],
    };
    const restored = restoreProfileExchange(exchange);
    expect(restored.profileGroups[0]).not.toHaveProperty("lastEnabledProfileIds");
    expect(restored.profiles[0]).not.toHaveProperty("ref");
    expect(restored.profiles[0]!.enabled).toBe(mockProfile.enabled);
    expect(restored.profiles[0]!.groupId).toBe(restored.profileGroups[0]!.id);
  });

  it("rejects empty groups and invalid radio state", () => {
    const valid = createProfileExchange([mockProfile, second], [group]);
    const item = valid.items[0]!;
    if (item.kind !== "group")
      throw new Error("Expected group");
    for (const invalid of [
      { ...item, profiles: [] },
      { ...item, type: "radio", profiles: item.profiles.map(profile => ({ ...profile, enabled: true })) },
    ]) {
      expect(profileExchangeZodSchema.safeParse({ version: 2, items: [invalid] }).success).toBe(false);
    }
    expect(profileExchangeZodSchema.safeParse({ version: 2, items: [] }).success).toBe(false);
  });
});
