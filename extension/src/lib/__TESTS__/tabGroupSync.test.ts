import { describe, expect, it } from "vitest";
import { applyTabGroupBindingChanges } from "@/entrypoints/background/tabGroupSync";
import { createProfile } from "../profileFactory";

describe("applyTabGroupBindingChanges", () => {
  it("removes closed tabs and removed groups from persisted snapshots", () => {
    const profile = createProfile({
      filters: {
        tabGroups: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440000",
            enabled: true,
            value: [
              { groupId: 7, tabIds: [41, 42] },
              { groupId: 8, tabIds: [43] },
            ],
          }],
        },
      },
    });
    const manager = {
      profileGroups: [],
      profiles: [profile],
      selectedProfileId: profile.id,
    };

    const result = applyTabGroupBindingChanges(manager, {
      removedGroupIds: new Set([8]),
      removedTabIds: new Set([41]),
    });

    expect(result.profiles[0]!.filters.tabGroups!.items[0]!.value).toEqual([
      { groupId: 7, tabIds: [42] },
    ]);
  });

  it("refreshes live memberships and drops stale session group IDs", () => {
    const profile = createProfile({
      filters: {
        excludedTabGroups: {
          type: "radio",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440001",
            enabled: true,
            value: [
              { groupId: 7, tabIds: [41] },
              { groupId: 8, tabIds: [42] },
            ],
          }],
        },
      },
    });
    const manager = {
      profileGroups: [],
      profiles: [profile],
      selectedProfileId: profile.id,
    };

    const result = applyTabGroupBindingChanges(manager, {
      refreshedTabIdsByGroupId: new Map([
        [7, [51, 52]],
        [8, []],
      ]),
    });

    expect(result.profiles[0]!.filters.excludedTabGroups!.items[0]!.value).toEqual([
      { groupId: 7, tabIds: [51, 52] },
    ]);
  });
});
