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
});
