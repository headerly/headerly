import { describe, expect, it } from "vitest";
import { fetchEcho, group, header, item, nextId, profile } from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

describe("documented profile editor and group operations", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("renames, comments, prioritizes, changes type, duplicates, and deletes profiles", async () => {
    const { extension } = state;
    const groupId = nextId();
    const target = profile({
      filters: { requestDomains: group([item("example.test")]) },
      groupId,
      name: "Original profile",
      requestHeaderModGroups: [group([header("x-original", "set", "value")])],
    });
    await extension.setProfiles([target], 1, [{
      color: "#8ab4f8",
      id: groupId,
      name: "Editor group",
      type: "checkbox",
    }]);
    const popup = await extension.openExtensionPage();

    await popup.getByTestId("profile-name").click();
    await popup.getByTestId("profile-name-input").fill("Renamed profile");
    await popup.getByTestId("profile-name-save").click();
    await expect.poll(async () => (await extension.manager()).profiles[0]?.name).toBe("Renamed profile");

    await popup.getByTestId(`profile-${target.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-comments").click();
    await popup.getByTestId("profile-comments-input").fill("Persistent profile note");
    await popup.getByTestId("profile-comments-save").click();
    await expect.poll(async () => (await extension.manager()).profiles[0]?.comments).toBe("Persistent profile note");

    await popup.getByTestId(`profile-${target.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-rulePriority").click();
    await popup.getByTestId("profile-priority-input").fill("42");
    await popup.getByTestId("profile-priority-save").click();
    await expect.poll(async () => (await extension.manager()).profiles[0]?.priority).toBe(42);

    await popup.getByTestId(`profile-${target.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-ruleActionType").click();
    await popup.getByTestId("profile-action-type-select").click();
    await popup.getByTestId("profile-action-type-block").click();
    await popup.getByTestId("profile-action-type-confirm").click();
    await expect.poll(async () => (await extension.manager()).profiles[0]?.ruleActionType).toBe("block");
    const changed = (await extension.manager()).profiles[0]!;
    expect(changed.requestHeaderModGroups).toBeUndefined();
    expect(changed.filters.requestDomains).toBeDefined();
    expect(changed.priority).toBe(42);

    await popup.getByTestId(`profile-${target.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-duplicate").click();
    await expect.poll(async () => (await extension.manager()).profiles).toHaveLength(2);
    const duplicated = (await extension.manager()).profiles[1]!;
    expect(duplicated.id).not.toBe(target.id);
    expect(duplicated.groupId).toBe(groupId);
    expect(duplicated.name).toBe("Renamed profile");

    await popup.getByTestId(`profile-${duplicated.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-delete").click();
    await expect.poll(async () => (await extension.manager()).profiles).toHaveLength(1);
    await popup.close();
  });

  it("resets rather than removes the only remaining profile", async () => {
    const { extension } = state;
    const target = profile({
      name: "Only profile",
      requestHeaderModGroups: [group([header("x-reset", "set", "value")])],
    });
    await extension.setProfiles([target], 1);
    const popup = await extension.openExtensionPage();
    await popup.getByTestId(`profile-${target.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-delete").click();

    await expect.poll(async () => (await extension.manager()).profiles[0]?.name).toBe("New Profile 1");
    const reset = (await extension.manager()).profiles[0]!;
    expect(reset.id).toBe(target.id);
    expect(reset.groupId).toBeUndefined();
    await popup.close();
  });

  it("applies checkbox and radio semantics to action-item groups", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    const first = header("x-checkbox-first", "set", "first");
    const second = header("x-checkbox-second", "set", "second");
    const checkboxGroup = group([first, second], "checkbox");
    const target = profile({ requestHeaderModGroups: [checkboxGroup] });
    await extension.setProfiles([target], 1);
    const popup = await extension.openExtensionPage();

    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-checkbox-second"])
      .toBe("second");
    await popup.getByTestId(`group-item-${second.id}`).click();
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.requestHeaderModGroups?.[0]?.items[1]?.enabled;
    }).toBe(false);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-checkbox-second"])
      .toBeUndefined();

    const radioFirst = header("x-radio", "set", "first");
    const radioSecond = { ...header("x-radio", "set", "second"), enabled: false };
    const manager = await extension.manager();
    manager.profiles[0]!.requestHeaderModGroups = [group([radioFirst, radioSecond], "radio")];
    await extension.updateManager(manager);
    await popup.reload();
    await popup.getByTestId(`group-item-${radioSecond.id}`).click();
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.requestHeaderModGroups?.[0]?.items.map(entry => entry.enabled);
    }).toEqual([false, true]);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-radio"])
      .toBe("second");
    await popup.close();
    await page.close();
  });

  it("pauses, remembers, resumes, and switches profile-group modes", async () => {
    const { extension } = state;
    const groupId = nextId();
    const first = profile({ groupId, name: "First", ruleActionType: "allow" });
    const second = profile({ groupId, name: "Second", ruleActionType: "allow" });
    await extension.setProfiles([first, second], 2, [{
      color: "#81c995",
      id: groupId,
      name: "Behavior group",
      type: "checkbox",
    }]);
    const popup = await extension.openExtensionPage();

    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-action-toggle-${groupId}`).click();
    await expect.poll(async () => (await extension.manager()).profiles.map(entry => entry.enabled))
      .toEqual([false, false]);
    expect((await extension.manager()).profileGroups[0]?.lastEnabledProfileIds?.toSorted())
      .toEqual([first.id, second.id].toSorted());

    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-action-toggle-${groupId}`).click();
    await expect.poll(async () => (await extension.manager()).profiles.map(entry => entry.enabled))
      .toEqual([true, true]);

    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-type-radio-${groupId}`).click();
    await expect.poll(async () => (await extension.manager()).profiles.map(entry => entry.enabled))
      .toEqual([true, false]);

    await popup.getByTestId(`profile-${second.id}`).click({ modifiers: ["Shift"] });
    await expect.poll(async () => (await extension.manager()).profiles.map(entry => entry.enabled))
      .toEqual([false, true]);
    expect((await extension.manager()).profileGroups[0]?.lastEnabledProfileIds).toBeUndefined();
    await popup.close();
  });

  it("ungroups every member and cleans up the empty profile group", async () => {
    const { extension } = state;
    const groupId = nextId();
    await extension.setProfiles([
      profile({ groupId, ruleActionType: "allow" }),
      profile({ groupId, ruleActionType: "allow" }),
    ], 2, [{ color: "#f28b82", id: groupId, name: "Disposable group", type: "checkbox" }]);
    const popup = await extension.openExtensionPage();

    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-action-ungroup-${groupId}`).click();
    await expect.poll(async () => (await extension.manager()).profileGroups).toEqual([]);
    expect((await extension.manager()).profiles.every(entry => entry.groupId === undefined)).toBe(true);
    await popup.close();
  });

  it("edits group metadata, creates members, moves profiles, and deletes the group", async () => {
    const { extension } = state;
    const groupId = nextId();
    const member = profile({ groupId, name: "Existing member", ruleActionType: "allow" });
    const ungrouped = profile({ name: "Move me", ruleActionType: "allow" });
    await extension.setProfiles([member, ungrouped], 2, [{
      color: "#dadce0",
      id: groupId,
      name: "Before edit",
      type: "checkbox",
    }]);
    const popup = await extension.openExtensionPage();

    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-name-${groupId}`).fill("After edit");
    await popup.getByTestId(`profile-group-color-${groupId}-3`).focus();
    await popup.getByTestId(`profile-group-color-${groupId}-3`).press("Space");
    await popup.keyboard.press("Escape");
    await expect.poll(async () => (await extension.manager()).profileGroups[0]?.name).toBe("After edit");
    await expect.poll(async () => (await extension.manager()).profileGroups[0]?.color).toBe("#fdd663");

    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-action-new-profile-${groupId}`).click();
    await expect.poll(async () => (await extension.manager()).profiles.filter(entry => entry.groupId === groupId))
      .toHaveLength(2);

    await popup.getByTestId(`profile-${ungrouped.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-addToGroup").hover();
    await popup.getByTestId(`profile-action-addToGroup-${groupId}`).click();
    await expect.poll(async () => (await extension.manager()).profiles.find(entry => entry.id === ungrouped.id)?.groupId)
      .toBe(groupId);

    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-action-delete-${groupId}`).click();
    await expect.poll(async () => (await extension.manager()).profileGroups.some(entry => entry.id === groupId))
      .toBe(false);
    expect((await extension.manager()).profiles.every(entry => entry.groupId !== groupId)).toBe(true);
    await popup.close();
  });

  it("applies radio semantics to condition items and opens export from the Share action", async () => {
    const { extension } = state;
    const firstDomain = item("first.example.test");
    const secondDomain = { ...item("second.example.test"), enabled: false };
    const target = profile({
      filters: { requestDomains: group([firstDomain, secondDomain], "radio") },
      requestHeaderModGroups: [group([header("x-condition-radio", "set", "matched")])],
    });
    await extension.setProfiles([target], 1);
    const popup = await extension.openExtensionPage();

    await popup.getByTestId(`group-item-${secondDomain.id}`).click();
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.filters.requestDomains?.items.map(entry => entry.enabled);
    }).toEqual([false, true]);

    await popup.getByTestId(`profile-${target.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-shareProfile").click();
    await expect.poll(() => popup.url()).toContain(`#/export/${target.id}`);
    await popup.close();
  });
});
