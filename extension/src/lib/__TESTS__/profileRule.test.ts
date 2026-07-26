import { describe, expect, it } from "vitest";
import { deriveRuleScope } from "../profileRule";

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
