import type { ProfileCoreData } from "../../diffProfiles";
import { describe, expect, it } from "vitest";
import { buildCondition } from "../buildCondition";

describe("buildCondition", () => {
  it("builds enabled tab ID conditions without duplicates", () => {
    const profile = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      enabled: true,
      ruleActionType: "block",
      filters: {
        tabIds: [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            enabled: true,
            value: [42, 43, 42],
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            enabled: false,
            value: [7],
          },
        ],
        excludedTabIds: [
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            enabled: true,
            value: [44],
          },
        ],
      },
    } satisfies ProfileCoreData;

    const condition = buildCondition(profile, {
      nativeResourceTypeBehavior: true,
    });

    expect(condition.tabIds).toEqual([42, 43]);
    expect(condition.excludedTabIds).toEqual([44]);
  });
});
