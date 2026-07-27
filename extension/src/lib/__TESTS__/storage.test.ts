import { describe, expect, it } from "vitest";
import { createProfile } from "../profileFactory";
import { useProfileManagerStorage } from "../storage";

describe("profile manager storage migrations", () => {
  it("removes the legacy ruleScope field when migrating to version 3", async () => {
    const profile = {
      ...createProfile(),
      ruleScope: "session",
    } as const;
    await storage.setItem("local:profileManager", {
      profileGroups: [],
      profiles: [profile],
      selectedProfileId: profile.id,
    });
    await storage.setMeta("local:profileManager", { v: 2 });

    const manager = await useProfileManagerStorage().item.getValue();

    expect(manager.profiles).toHaveLength(1);
    expect(manager.profiles[0]).not.toHaveProperty("ruleScope");
  });

  it("wraps legacy array filters in radio groups when migrating to version 4", async () => {
    const profile = createProfile();
    const resourceTypes = [{
      id: "550e8400-e29b-41d4-a716-446655440000",
      enabled: true,
      value: ["script"],
    }];
    const tabIds = [{
      id: "550e8400-e29b-41d4-a716-446655440001",
      enabled: true,
      value: [42],
    }];
    await storage.setItem("local:profileManager", {
      profileGroups: [],
      profiles: [{
        ...profile,
        filters: {
          resourceTypes,
          tabIds,
        },
      }],
      selectedProfileId: profile.id,
    });
    await storage.setMeta("local:profileManager", { v: 3 });

    const manager = await useProfileManagerStorage().item.getValue();

    expect(manager.profiles[0]!.filters.resourceTypes).toEqual({
      type: "radio",
      items: resourceTypes,
    });
    expect(manager.profiles[0]!.filters.tabIds).toEqual({
      type: "radio",
      items: tabIds,
    });
  });
});
