import type { Profile } from "@/lib/schema";
import { describe, expect, it } from "vitest";
import { createProfile } from "@/lib/profileFactory";
import { handleProfileRuleActionTypeChanged } from "../actions";

describe("handleProfileRuleActionTypeChanged", () => {
  it("keeps only frame resource types when converting to allowAllRequests", async () => {
    const profile = createProfile({
      ruleActionType: "allowAllRequests",
      filters: {
        resourceTypes: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440001",
            enabled: true,
            value: ["main_frame", "script", "sub_frame"],
          }],
        },
        excludedResourceTypes: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440002",
            enabled: true,
            value: ["image", "sub_frame"],
          }],
        },
      },
    });

    await handleProfileRuleActionTypeChanged(profile);

    const filters = profile.filters as Profile["filters"];
    expect(filters.resourceTypes?.items[0]?.value).toEqual(["main_frame", "sub_frame"]);
    expect(filters.excludedResourceTypes?.items[0]?.value).toEqual(["sub_frame"]);
  });
});
