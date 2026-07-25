import type { ProfileCoreData } from "../..";
import { describe, expect, it } from "vitest";
import { buildCondition } from "../buildCondition";

describe("buildCondition", () => {
  it("builds enabled tab ID conditions without duplicates", () => {
    const profile = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      enabled: true,
      ruleActionType: "block",
      ruleScope: "session",
      filters: {
        tabIds: [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            enabled: true,
            value: 42,
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            enabled: true,
            value: 42,
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            enabled: false,
            value: 7,
          },
        ],
        excludedTabIds: [
          {
            id: "550e8400-e29b-41d4-a716-446655440004",
            enabled: true,
            value: browser.tabs.TAB_ID_NONE,
          },
        ],
      },
    } satisfies ProfileCoreData;

    const condition = buildCondition(profile, {
      nativeResourceTypeBehavior: true,
    });

    expect(condition.tabIds).toEqual([42]);
    expect(condition.excludedTabIds).toEqual([browser.tabs.TAB_ID_NONE]);
  });
});
