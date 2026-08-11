import { describe, expect, it } from "vitest";
import { fetchEcho, group, header, profile } from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

describe("documented profile and rule lifecycle", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("maps each enabled registerable profile to one rule and updates the badge", async () => {
    const { extension } = state;
    const first = profile({ requestHeaderModGroups: [group([header("x-first", "set", "1")])] });
    const second = profile({ requestHeaderModGroups: [group([header("x-second", "set", "2")])] });
    await extension.setProfiles([first, second], 2);

    expect(Object.keys(await extension.registrations()).sort()).toEqual([first.id, second.id].sort());
    await expect.poll(() => extension.badgeText()).toBe("2");
  });

  it("supports Shift+Click and middle-click for pause and resume", async () => {
    const { extension } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-toggle", "set", "on")])] });
    await extension.setProfiles([target], 1);
    const popup = await extension.openExtensionPage();
    const profileButton = popup.getByTestId(`profile-${target.id}`);

    await profileButton.click({ modifiers: ["Shift"] });
    await expect.poll(async () => (await extension.manager()).profiles[0]?.enabled).toBe(false);
    await expect.poll(() => extension.ruleCount()).toBe(0);

    await profileButton.click({ button: "middle" });
    await expect.poll(async () => (await extension.manager()).profiles[0]?.enabled).toBe(true);
    await expect.poll(() => extension.ruleCount()).toBe(1);
    await popup.close();
  });

  it("updates a registered rule when rule-relevant profile data changes", async () => {
    const { extension, server } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-live-update", "set", "before")])] });
    await extension.setProfiles([target], 1);
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-live-update"])
      .toBe("before");

    const manager = await extension.manager();
    const modification = manager.profiles[0]?.requestHeaderModGroups?.[0]?.items[0];
    if (!modification || modification.operation === "remove") {
      throw new Error("Expected a set header modification");
    }
    modification.value = "after";
    await extension.updateManager(manager);
    await expect.poll(async () => {
      return (await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-live-update"];
    }).toBe("after");
    expect(await extension.ruleCount()).toBe(1);
    await page.close();
  });

  it("turns every Headerly rule off and back on without deleting profiles", async () => {
    const { extension } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-power", "set", "on")])] });
    await extension.setProfiles([target], 1);
    const popup = await extension.openExtensionPage();

    await popup.getByTestId("extension-power").click();
    await expect.poll(() => extension.ruleCount()).toBe(0);
    expect((await extension.manager()).profiles).toHaveLength(1);
    expect((await extension.manager()).profiles[0]?.enabled).toBe(true);

    await popup.getByTestId("extension-power").click();
    await expect.poll(() => extension.ruleCount()).toBe(1);
    await popup.close();
  });

  it("reinitializes missing browser rules from saved profiles", async () => {
    const { extension } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-reinitialize", "set", "on")])] });
    await extension.setProfiles([target], 1);
    await extension.removeBrowserRules();
    expect(await extension.ruleCount()).toBe(0);

    const settings = await extension.openExtensionPage("/settings");
    await settings.getByTestId("reinitialize-all-rules").click();
    await expect.poll(() => extension.ruleCount()).toBe(1);
    expect((await extension.manager()).profiles[0]?.id).toBe(target.id);
    await settings.close();
  });

  it("retains invalid profiles with errors and registers them after correction", async () => {
    const { extension } = state;
    const invalid = profile({
      requestHeaderModGroups: [group([header("x-invalid-append", "append", "value")])],
    });
    await extension.setProfiles([invalid], 0);
    await expect.poll(async () => (await extension.errors())[invalid.id]).toBeTypeOf("string");
    expect((await extension.manager()).profiles[0]?.id).toBe(invalid.id);

    const manager = await extension.manager();
    const modification = manager.profiles[0]?.requestHeaderModGroups?.[0]?.items[0];
    if (!modification || modification.operation === "remove") {
      throw new Error("Expected an append header modification");
    }
    modification.operation = "set";
    await extension.updateManager(manager);
    await expect.poll(() => extension.ruleCount()).toBe(1);
    await expect.poll(async () => (await extension.errors())[invalid.id]).toBeUndefined();
  });

  it("registers complete no-field actions and skips incomplete field-based actions", async () => {
    const { extension } = state;
    const emptyModify = profile({ requestHeaderModGroups: [] });
    const emptyRedirect = profile({ redirectUrlGroup: [], ruleActionType: "redirect" });
    const block = profile({ ruleActionType: "block" });
    const allow = profile({ ruleActionType: "allow" });
    const upgrade = profile({ ruleActionType: "upgradeScheme" });
    await extension.setProfiles([emptyModify, emptyRedirect, block, allow, upgrade], 3);

    const registrations = await extension.registrations();
    expect(registrations[emptyModify.id]).toBeUndefined();
    expect(registrations[emptyRedirect.id]).toBeUndefined();
    expect(registrations[block.id]).toBeDefined();
    expect(registrations[allow.id]).toBeDefined();
    expect(registrations[upgrade.id]).toBeDefined();
  });

  it("uses priority 1 by default and preserves the maximum supported priority", async () => {
    const { extension } = state;
    await extension.setProfiles([
      profile({ requestHeaderModGroups: [group([header("x-default-priority", "set", "1")])] }),
      profile({
        priority: 2_147_483_647,
        requestHeaderModGroups: [group([header("x-max-priority", "set", "1")])],
      }),
    ], 2);

    expect((await extension.rules()).map(rule => rule.priority).toSorted((a, b) => a - b))
      .toEqual([1, 2_147_483_647]);
  });
});
