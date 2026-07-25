import type { ProfileCoreData } from "../..";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNativeResourceTypeBehaviorStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { reconcileRuleRegistrationState, updateRules } from "../registerRule";

const profile = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  enabled: true,
  ruleActionType: "block",
  ruleScope: "dynamic",
  filters: {},
} satisfies ProfileCoreData;

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
  vi.spyOn(browser.action, "setBadgeText").mockImplementation(async () => {});
  vi.spyOn(browser.action, "setBadgeTextColor").mockImplementation(async () => {});
  vi.spyOn(browser.action, "setBadgeBackgroundColor").mockImplementation(async () => {});
  await Promise.all([
    useNativeResourceTypeBehaviorStorage().item.setValue(true),
    useProfileId2RelatedRuleIdRecordStorage().item.setValue({}),
  ]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateRules", () => {
  it("registers session profiles in the session ruleset", async () => {
    const sessionProfile = {
      ...profile,
      ruleScope: "session",
    } satisfies ProfileCoreData;

    await updateRules({
      deleted: [],
      modified: [],
      created: [sessionProfile],
    });

    expect(await browser.declarativeNetRequest.getDynamicRules()).toHaveLength(0);
    expect(await browser.declarativeNetRequest.getSessionRules()).toHaveLength(1);
    expect(await useProfileId2RelatedRuleIdRecordStorage().item.getValue()).toEqual({
      [profile.id]: {
        ruleId: 1,
        ruleScope: "session",
      },
    });
  });

  it("moves a modified profile between rule scopes", async () => {
    await updateRules({
      deleted: [],
      modified: [],
      created: [profile],
    });
    const sessionProfile = {
      ...profile,
      ruleScope: "session",
    } satisfies ProfileCoreData;

    await updateRules({
      deleted: [],
      modified: [sessionProfile],
      created: [],
    });

    expect(await browser.declarativeNetRequest.getDynamicRules()).toHaveLength(0);
    expect(await browser.declarativeNetRequest.getSessionRules()).toHaveLength(1);
  });

  it("upserts profiles received as created more than once", async () => {
    await updateRules({
      deleted: [],
      modified: [],
      created: [profile],
    });
    await updateRules({
      deleted: [],
      modified: [],
      created: [profile],
    });

    expect(await browser.declarativeNetRequest.getDynamicRules()).toHaveLength(1);
    expect(await useProfileId2RelatedRuleIdRecordStorage().item.getValue()).toEqual({
      [profile.id]: {
        ruleId: 2,
        ruleScope: "dynamic",
      },
    });
  });
});

describe("reconcileRuleRegistrationState", () => {
  it("removes registration state for expired session rules", async () => {
    const sessionProfile = {
      ...profile,
      ruleScope: "session",
    } satisfies ProfileCoreData;
    await updateRules({
      deleted: [],
      modified: [],
      created: [sessionProfile],
    });
    const sessionRules = await browser.declarativeNetRequest.getSessionRules();
    await browser.declarativeNetRequest.updateSessionRules({
      removeRuleIds: sessionRules.map(rule => rule.id),
    });

    await reconcileRuleRegistrationState([sessionProfile.id]);

    expect(await useProfileId2RelatedRuleIdRecordStorage().item.getValue()).toEqual({});
  });

  it("removes orphaned rules from both rulesets", async () => {
    const sessionProfile = {
      ...profile,
      id: "550e8400-e29b-41d4-a716-446655440001",
      ruleScope: "session",
    } satisfies ProfileCoreData;
    await updateRules({
      deleted: [],
      modified: [],
      created: [profile, sessionProfile],
    });
    dynamicRules.push({
      id: 99,
      priority: 1,
      condition: {},
      action: { type: "block" },
    });
    sessionRules.push({
      id: 99,
      priority: 1,
      condition: {},
      action: { type: "block" },
    });

    await reconcileRuleRegistrationState([profile.id, sessionProfile.id]);

    expect(dynamicRules.map(rule => rule.id)).toEqual([1]);
    expect(sessionRules.map(rule => rule.id)).toEqual([1]);
  });
});
