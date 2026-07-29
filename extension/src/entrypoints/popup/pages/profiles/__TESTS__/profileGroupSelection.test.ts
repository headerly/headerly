import { describe, expect, it } from "vitest";
import { findProfileIdAfterGroupCollapse } from "../components/Sidebar/components/profileGroupSelection";

const blocks = [
  { type: "group", groupId: "group-1", profileIds: ["profile-1", "profile-2"] },
  { type: "group", groupId: "group-2", profileIds: ["profile-3"] },
  { type: "group", groupId: "group-3", profileIds: ["profile-4", "profile-5"] },
  { type: "group", groupId: "group-4", profileIds: ["profile-6"] },
] as const;

describe("findProfileIdAfterGroupCollapse", () => {
  it("selects the first profile from the first open group below", () => {
    const profileId = findProfileIdAfterGroupCollapse(
      blocks,
      "group-2",
      new Set(["group-1", "group-3", "group-4"]),
    );

    expect(profileId).toBe("profile-4");
  });

  it("skips collapsed groups below", () => {
    const profileId = findProfileIdAfterGroupCollapse(
      blocks,
      "group-2",
      new Set(["group-1", "group-4"]),
    );

    expect(profileId).toBe("profile-6");
  });

  it("searches upward when there is no visible profile below", () => {
    const profileId = findProfileIdAfterGroupCollapse(
      blocks,
      "group-3",
      new Set(["group-1"]),
    );

    expect(profileId).toBe("profile-1");
  });

  it("selects an ungrouped profile below a collapsed group", () => {
    const profileId = findProfileIdAfterGroupCollapse(
      [
        blocks[0],
        { type: "profile", profileId: "ungrouped-profile" },
        blocks[1],
      ],
      "group-1",
      new Set(),
    );

    expect(profileId).toBe("ungrouped-profile");
  });

  it("selects an ungrouped profile above when there is no visible profile below", () => {
    const profileId = findProfileIdAfterGroupCollapse(
      [
        { type: "profile", profileId: "ungrouped-profile" },
        blocks[0],
        blocks[1],
      ],
      "group-2",
      new Set(),
    );

    expect(profileId).toBe("ungrouped-profile");
  });

  it("returns no profile when every group is collapsed and no ungrouped profile exists", () => {
    const profileId = findProfileIdAfterGroupCollapse(
      blocks,
      "group-2",
      new Set(),
    );

    expect(profileId).toBeUndefined();
  });
});
