import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";
import { setupExtensionSuite } from "../suite";
import { fetchEcho, group, header, item, profile } from "../test-util";

describe("rule replacement, recovery and persistence", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("removes a previously valid rule after an invalid edit and isolates other profiles", async () => {
    const { extension, server } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-replaced", "set", "before")])] });
    const unaffected = profile({ requestHeaderModGroups: [group([header("x-unaffected", "set", "present")])] });
    await extension.setProfiles([target, unaffected], 2);
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-replaced"]).toBe("before");

    const manager = await extension.manager();
    manager.profiles[0]!.requestHeaderModGroups = [group([header("x-replaced", "append", "invalid")])];
    await extension.updateManager(manager);
    await expect.poll(async () => (await extension.errors())[target.id]).toMatch(/append|header/i);
    await expect.poll(() => extension.ruleCount()).toBe(1);
    expect((await extension.registrations())[target.id]).toBeUndefined();
    const echo = await fetchEcho(page, `${server.loopbackOrigin}/echo`);
    expect(echo.headers["x-replaced"]).toBeUndefined();
    expect(echo.headers["x-unaffected"]).toBe("present");

    manager.profiles.splice(0, 1);
    manager.selectedProfileId = unaffected.id;
    await extension.updateManager(manager);
    await expect.poll(() => extension.errors()).toEqual({});
    expect(Object.keys(await extension.registrations())).toEqual([unaffected.id]);
  });

  it("moves the same profile from dynamic to session rules and back without orphan rules", async () => {
    const { extension, server } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-scope", "set", "active")])] });
    await extension.setProfiles([target], 1);
    const first = await extension.context.newPage();
    const second = await extension.context.newPage();
    await first.goto(`${server.loopbackOrigin}/page?scope=first`);
    await second.goto(`${server.loopbackOrigin}/page?scope=second`);
    const firstId = await extension.tabId(first);
    expect((await extension.registrations())[target.id]?.ruleScope).toBe("dynamic");
    expect((await fetchEcho(second, `${server.loopbackOrigin}/echo`)).headers["x-scope"]).toBe("active");

    const manager = await extension.manager();
    manager.profiles[0]!.filters.tabIds = group([item([firstId])]);
    await extension.updateManager(manager);
    await expect.poll(async () => (await extension.registrations())[target.id]?.ruleScope).toBe("session");
    expect(await extension.ruleCount()).toBe(1);
    expect((await fetchEcho(first, `${server.loopbackOrigin}/echo`)).headers["x-scope"]).toBe("active");
    expect((await fetchEcho(second, `${server.loopbackOrigin}/echo`)).headers["x-scope"]).toBeUndefined();

    delete manager.profiles[0]!.filters.tabIds;
    await extension.updateManager(manager);
    await expect.poll(async () => (await extension.registrations())[target.id]?.ruleScope).toBe("dynamic");
    expect(await extension.ruleCount()).toBe(1);
    expect((await fetchEcho(second, `${server.loopbackOrigin}/echo`)).headers["x-scope"]).toBe("active");
    expect(await extension.errors()).toEqual({});
  });

  it("removes the last action and restores it without leaving an old rule active", async () => {
    const { extension, server } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-empty-action", "set", "active")])] });
    await extension.setProfiles([target], 1);
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    const manager = await extension.manager();
    manager.profiles[0]!.requestHeaderModGroups = [];
    await extension.updateManager(manager);
    await expect.poll(() => extension.registrations()).toEqual({});
    expect(await extension.ruleCount()).toBe(0);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-empty-action"]).toBeUndefined();

    manager.profiles[0]!.requestHeaderModGroups = target.requestHeaderModGroups;
    await extension.updateManager(manager);
    await expect.poll(async () => (await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-empty-action"]).toBe("active");
    expect(await extension.ruleCount()).toBe(1);
  });

  it("applies the latest edits after power-on and keeps reinitialization inert while powered off", async () => {
    const { extension, server } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-power-edit", "set", "before")])] });
    const deleted = profile({ requestHeaderModGroups: [group([header("x-deleted", "set", "before")])] });
    await extension.setProfiles([target, deleted], 2);
    await extension.setPower(false);
    await expect.poll(() => extension.badgeText()).toBe("❚❚");
    const manager = await extension.manager();
    manager.profiles = [{ ...target, requestHeaderModGroups: [group([header("x-power-edit", "set", "after")])] }];
    await extension.updateManager(manager);
    const settings = await extension.openExtensionPage("/settings");
    await settings.getByTestId("reinitialize-all-rules").click();
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-power-edit"]).toBeUndefined();
    expect(await extension.registrations()).toEqual({});
    expect(await extension.ruleCount()).toBe(0);

    await extension.setPower(true);
    await expect.poll(async () => (await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-power-edit"]).toBe("after");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-deleted"]).toBeUndefined();
    await expect.poll(async () => Object.keys(await extension.registrations())).toEqual([target.id]);
  });

  it("preserves rules for metadata-only changes while applying another profile's rule edit", async () => {
    const { extension } = state;
    const target = profile({ requestHeaderModGroups: [group([header("x-metadata", "set", "same")])] });
    const changed = profile({ requestHeaderModGroups: [group([header("x-barrier", "set", "value")])] });
    await extension.setProfiles([target, changed], 2);
    const before = (await extension.registrations())[target.id];
    const manager = await extension.manager();
    const groupId = uuidv7();
    Object.assign(manager.profiles[0]!, { comments: "A note", emoji: "📝", groupId, name: "Renamed" });
    manager.profileGroups = [{ color: "#8ab4f8", id: groupId, name: "Metadata group", type: "checkbox" }];
    manager.selectedProfileId = changed.id;
    manager.profiles[1]!.priority = 42;
    await extension.updateManager(manager);
    // The second profile's edit proves the shared storage event was processed.
    await expect.poll(async () => (await extension.rules()).some(rule => rule.priority === 42)).toBe(true);
    expect((await extension.registrations())[target.id]).toEqual(before);
    expect(await extension.ruleCount()).toBe(2);
  });

  it.each([true, false])("preserves dynamic profiles and power=%s across browser restart", async (powerOn) => {
    const { extension, server } = state;
    const active = profile({ requestHeaderModGroups: [group([header("x-persisted", "set", "active")])] });
    const paused = profile({ enabled: false, requestHeaderModGroups: [group([header("x-paused", "set", "inactive")])] });
    await extension.setProfiles([active, paused], 1);
    if (!powerOn) {
      await extension.setPower(false);
      await expect.poll(() => extension.badgeText()).toBe("❚❚");
    }
    const before = await extension.manager();
    await extension.restart();
    await expect.poll(() => extension.badgeText()).toBe(powerOn ? "1" : "❚❚");
    expect(await extension.manager()).toEqual(before);
    expect(await extension.ruleCount()).toBe(powerOn ? 1 : 0);
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    const echo = await fetchEcho(page, `${server.loopbackOrigin}/echo`);
    expect(echo.headers["x-persisted"]).toBe(powerOn ? "active" : undefined);
    expect(echo.headers["x-paused"]).toBeUndefined();
  });
});
