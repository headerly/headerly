import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { reconcileRuleRegistrationState, updateRules } from "../registerRule";

const profileId = "550e8400-e29b-41d4-a716-446655440000";
let dynamicRules: Browser.declarativeNetRequest.Rule[] = [];
let sessionRules: Browser.declarativeNetRequest.Rule[] = [];

function applyRuleUpdate(
  rules: Browser.declarativeNetRequest.Rule[],
  options: Browser.declarativeNetRequest.UpdateRuleOptions,
) {
  const removeRuleIds = new Set(options.removeRuleIds ?? []);
  return [
    ...rules.filter(rule => !removeRuleIds.has(rule.id)),
    ...(options.addRules ?? []),
  ];
}

beforeEach(async () => {
  dynamicRules = [];
  sessionRules = [];
  vi.spyOn(browser.declarativeNetRequest, "getDynamicRules")
    .mockImplementation(async () => dynamicRules);
  vi.spyOn(browser.declarativeNetRequest, "getSessionRules")
    .mockImplementation(async () => sessionRules);
  vi.spyOn(browser.declarativeNetRequest, "updateDynamicRules")
    .mockImplementation(async (options) => {
      dynamicRules = applyRuleUpdate(dynamicRules, options);
    });
  vi.spyOn(browser.declarativeNetRequest, "updateSessionRules")
    .mockImplementation(async (options) => {
      sessionRules = applyRuleUpdate(sessionRules, options);
    });
  await useProfileId2RelatedRuleIdRecordStorage().item.setValue({});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("reconcileRuleRegistrationState", () => {
  it("keeps session rules backed by a temporary tab binding", async () => {
    sessionRules = [{
      id: 1,
      priority: 1,
      condition: { tabIds: [42] },
      action: { type: "block" },
    }];
    await useProfileId2RelatedRuleIdRecordStorage().item.setValue({
      [profileId]: { ruleId: 1, ruleScope: "session" },
    });

    const registrationRecord = await reconcileRuleRegistrationState([profileId]);

    expect(registrationRecord).toEqual({
      [profileId]: { ruleId: 1, ruleScope: "session" },
    });
    expect(sessionRules).toHaveLength(1);
  });

  it("removes legacy session rules without a temporary tab binding", async () => {
    sessionRules = [{
      id: 1,
      priority: 1,
      condition: {},
      action: { type: "block" },
    }];
    await useProfileId2RelatedRuleIdRecordStorage().item.setValue({
      [profileId]: { ruleId: 1, ruleScope: "session" },
    });

    const registrationRecord = await reconcileRuleRegistrationState([profileId]);

    expect(registrationRecord).toEqual({});
    expect(sessionRules).toHaveLength(0);
  });
});

describe("updateRules", () => {
  it("registers a tab-bound profile as a session rule", async () => {
    await updateRules({
      deleted: [],
      modified: [],
      created: [{
        id: profileId,
        enabled: true,
        ruleActionType: "block",
        filters: {
          resourceTypes: [{
            id: "550e8400-e29b-41d4-a716-446655440002",
            enabled: true,
            value: ["main_frame"],
          }],
          tabIds: [{
            id: "550e8400-e29b-41d4-a716-446655440001",
            enabled: true,
            value: [42],
          }],
        },
      }],
    });

    expect(dynamicRules).toHaveLength(0);
    expect(sessionRules).toHaveLength(1);
    expect(sessionRules[0]!.condition.tabIds).toEqual([42]);
    expect(await useProfileId2RelatedRuleIdRecordStorage().item.getValue()).toEqual({
      [profileId]: { ruleId: 1, ruleScope: "session" },
    });
  });
});
