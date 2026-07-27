import { describe, expect, it } from "vitest";
import { hasImplicitAction } from "../utils";

describe("hasImplicitAction", () => {
  it.each([
    "allow",
    "allowAllRequests",
    "block",
    "upgradeScheme",
  ] as const)("returns true for %s profiles", (ruleActionType) => {
    expect(hasImplicitAction(ruleActionType)).toBe(true);
  });

  it.each([
    "modifyHeaders",
    "redirect",
  ] as const)("returns false for %s profiles", (ruleActionType) => {
    expect(hasImplicitAction(ruleActionType)).toBe(false);
  });
});
