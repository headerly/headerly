import type { Profile } from "../schema";
import type { ProfileManager } from "../types";
import { describe, expect, it } from "vitest";
import { refreshTabGroupBindings } from "@/entrypoints/background/tabGroupSync";
import { removeClosedTabIds } from "@/entrypoints/background/tabIdCleanup";
import { createProfile } from "../profileFactory";

function createManager(profile: Profile): ProfileManager {
  return {
    profileGroups: [],
    profiles: [profile],
    selectedProfileId: profile.id,
  };
}

describe("temporary tab binding cleanup", () => {
  it("disables a profile when its last tab ID is removed", () => {
    const manager = createManager(createProfile({
      filters: {
        tabIds: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440000",
            enabled: true,
            value: [42],
          }],
        },
      },
    }));

    const nextManager = removeClosedTabIds(manager, new Set([42]));

    expect(nextManager.profiles[0]?.enabled).toBe(false);
    expect(nextManager.profiles[0]?.filters.tabIds?.items[0]?.value).toEqual([]);
  });

  it("keeps a profile enabled while its tab ID filter still matches a tab", () => {
    const manager = createManager(createProfile({
      filters: {
        tabIds: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440001",
            enabled: true,
            value: [42, 43],
          }],
        },
      },
    }));

    const nextManager = removeClosedTabIds(manager, new Set([42]));

    expect(nextManager.profiles[0]?.enabled).toBe(true);
    expect(nextManager.profiles[0]?.filters.tabIds?.items[0]?.value).toEqual([43]);
  });

  it("disables a profile when its last tab group becomes empty", () => {
    const manager = createManager(createProfile({
      filters: {
        tabGroups: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440002",
            enabled: true,
            value: [{ groupId: 7, tabIds: [42, 43] }],
          }],
        },
      },
    }));

    const nextManager = refreshTabGroupBindings(manager, new Map([[7, []]]));

    expect(nextManager.profiles[0]?.enabled).toBe(false);
    expect(nextManager.profiles[0]?.filters.tabGroups?.items[0]?.value).toEqual([]);
  });
});
