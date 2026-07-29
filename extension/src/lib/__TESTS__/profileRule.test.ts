import { describe, expect, it } from "vitest";
import { deriveRuleScope, hasTemporaryTabBinding } from "@/entrypoints/background/profileRule";

describe("deriveRuleScope", () => {
  it("uses dynamic rules when the condition has no temporary tab binding", () => {
    expect(deriveRuleScope({})).toBe("dynamic");
  });

  it("uses session rules for included tab bindings", () => {
    expect(deriveRuleScope({ tabIds: [42] })).toBe("session");
  });

  it("uses session rules for excluded tab bindings", () => {
    expect(deriveRuleScope({ excludedTabIds: [42] })).toBe("session");
  });
});

describe("hasTemporaryTabBinding", () => {
  it("detects enabled non-empty tab filters", () => {
    expect(hasTemporaryTabBinding({
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
    })).toBe(true);
  });

  it("ignores disabled and empty tab filters", () => {
    expect(hasTemporaryTabBinding({
      filters: {
        excludedTabIds: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440000",
            enabled: false,
            value: [42],
          }],
        },
        tabIds: {
          type: "checkbox",
          items: [{
            id: "550e8400-e29b-41d4-a716-446655440001",
            enabled: true,
            value: [],
          }],
        },
      },
    })).toBe(false);
  });

  it("detects tab group snapshots with live tabs", () => {
    expect(hasTemporaryTabBinding({
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
    })).toBe(true);
  });
});
