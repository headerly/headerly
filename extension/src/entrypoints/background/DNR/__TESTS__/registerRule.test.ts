import type { ProfileCoreData } from "../..";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNativeResourceTypeBehaviorStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { reconcileRuleRegistrationState, updateRules } from "../registerRule";

const profile = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  enabled: true,
  ruleActionType: "block",
  filters: {},
} satisfies ProfileCoreData;

let dynamicRules: Browser.declarativeNetRequest.Rule[] = [];

function applyRuleUpdate(options: Browser.declarativeNetRequest.UpdateRuleOptions) {
  const removeRuleIds = new Set(options.removeRuleIds ?? []);
  dynamicRules = [
    ...dynamicRules.filter(rule => !removeRuleIds.has(rule.id)),
    ...(options.addRules ?? []),
  ];
}

beforeEach(async () => {
  dynamicRules = [];
  vi.spyOn(browser.declarativeNetRequest, "getDynamicRules")
    .mockImplementation(async () => dynamicRules);
  vi.spyOn(browser.declarativeNetRequest, "updateDynamicRules")
    .mockImplementation(async options => applyRuleUpdate(options));
  vi.spyOn(browser.action, "setBadgeText").mockImplementation(async () => {});
  vi.spyOn(browser.action, "setBadgeTextColor").mockImplementation(async () => {});
  vi.spyOn(browser.action, "setBadgeBackgroundColor").mockImplementation(async () => {});
  vi.spyOn(browser.action, "setIcon").mockImplementation(async () => {});
  vi.spyOn(browser.runtime, "getManifest").mockReturnValue({
    manifest_version: 3,
    name: "Headerly",
    version: "1.0.0",
    icons: { 32: "icon/32.png" },
  });
  await Promise.all([
    useNativeResourceTypeBehaviorStorage().item.setValue(true),
    useProfileId2RelatedRuleIdRecordStorage().item.setValue({}),
  ]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateRules", () => {
  it("replaces an existing rule when the same profile is created twice", async () => {
    const changes = {
      deleted: [],
      modified: [],
      created: [profile],
    } satisfies Parameters<typeof updateRules>[0];

    await updateRules(changes);
    await updateRules(changes);

    const registrationRecord = await useProfileId2RelatedRuleIdRecordStorage().item.getValue();
    expect(dynamicRules).toHaveLength(1);
    expect(registrationRecord).toEqual({ [profile.id]: dynamicRules[0]!.id });
  });
});

describe("reconcileRuleRegistrationState", () => {
  it("removes rules without a current profile mapping and mappings without a rule", async () => {
    dynamicRules = [
      { id: 1, priority: 1, action: { type: "block" }, condition: {} },
      { id: 2, priority: 1, action: { type: "block" }, condition: {} },
    ];
    await useProfileId2RelatedRuleIdRecordStorage().item.setValue({
      [profile.id]: 1,
      "6ba7b810-9dad-41d1-80b4-00c04fd430c8": 2,
      "6ba7b811-9dad-41d1-80b4-00c04fd430c8": 3,
    });

    await reconcileRuleRegistrationState([profile.id]);

    expect(dynamicRules.map(rule => rule.id)).toEqual([1]);
    expect(await useProfileId2RelatedRuleIdRecordStorage().item.getValue())
      .toEqual({ [profile.id]: 1 });
  });
});
