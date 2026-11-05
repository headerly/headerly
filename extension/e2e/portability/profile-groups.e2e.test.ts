import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";
import { setupExtensionSuite } from "../suite";
import { editorText, profile, setEditorText } from "../test-util";
import { exportedJson } from "./exchange-util";

describe("group export and import", { concurrent: false }, () => {
  const state = setupExtensionSuite();
  it("selects groups, keeps partial selections nested, and imports groups without local pause history", async () => {
    const { extension } = state;
    const groupId = uuidv7();
    const first = profile({ name: "Portable profile", enabled: false, groupId });
    const second = profile({ name: "Second member", enabled: false, groupId });
    const standalone = profile({ name: "Standalone", enabled: false });
    await extension.setProfiles([first, second, standalone], 0, [{
      id: groupId,
      name: "Shared group",
      color: "#8ab4f8",
      type: "radio",
      lastEnabledProfileIds: [second.id],
    }]);
    const popup = await extension.openExtensionPage("/profiles");
    await popup.getByTestId(`profile-group-${groupId}`).click({ button: "right" });
    await popup.getByTestId(`profile-group-action-share-${groupId}`).click();
    await expect.poll(() => popup.url()).toContain(`groupId=${groupId}`);
    let exported = await exportedJson(popup);
    expect(exported.items).toHaveLength(1);
    expect(JSON.stringify(exported)).not.toContain("lastEnabledProfile");
    expect(JSON.stringify(exported)).not.toContain("\"ref\"");
    expect(exported.items[0]).toMatchObject({ kind: "group", profiles: [{ name: first.name }, { name: second.name }] });
    await popup.getByTestId(`export-profile-${second.id}`).click();
    await expect.poll(() => popup.getByTestId(`export-group-${groupId}`).getAttribute("aria-pressed")).toBe("mixed");
    exported = await exportedJson(popup);
    expect(exported.items[0]).toMatchObject({ kind: "group", profiles: [{ name: first.name }] });
    await popup.getByTestId(`export-group-${groupId}`).click();
    await expect.poll(() => popup.getByTestId(`export-group-${groupId}`).getAttribute("aria-pressed")).toBe("true");
    exported = await exportedJson(popup);
    await popup.getByTestId("export-select-all").click();
    expect((await exportedJson(popup)).items).toHaveLength(2);
    await popup.getByTestId("export-select-all").click();
    await expect.poll(() => editorText(popup)).toBe("");
    await popup.close();

    const importPage = await extension.openExtensionPage("/import");
    await setEditorText(importPage, JSON.stringify(exported));
    await importPage.getByTestId("import-confirm").click();
    await expect.poll(async () => (await extension.manager()).profileGroups).toHaveLength(2);
    const manager = await extension.manager();
    const restoredGroup = manager.profileGroups[1]!;
    const restoredProfiles = manager.profiles.filter(entry => entry.groupId === restoredGroup.id);
    expect(restoredGroup.id).not.toBe(groupId);
    expect(restoredGroup).not.toHaveProperty("lastEnabledProfileIds");
    expect(restoredProfiles.every(entry => !entry.enabled)).toBe(true);
    expect(manager.profileGroups[0]!.lastEnabledProfileIds).toEqual([second.id]);
    expect(restoredGroup).toMatchObject({ name: "Shared group", type: "radio" });
    expect(restoredProfiles.map(entry => entry.name)).toEqual([first.name, second.name]);
    await importPage.getByRole("button", { name: "Undo", exact: true }).click();
    await expect.poll(async () => (await extension.manager()).profileGroups.map(entry => entry.id)).toEqual([groupId]);
    await expect.poll(async () => (await extension.manager()).profiles.map(entry => entry.id)).toEqual([first.id, second.id, standalone.id]);
    await importPage.getByRole("button", { name: "Redo", exact: true }).click();
    await expect.poll(async () => (await extension.manager()).profileGroups.map(entry => entry.id)).toEqual([groupId, restoredGroup.id]);
    await expect.poll(async () => (await extension.manager()).profiles).toHaveLength(5);
    await importPage.getByTestId(`profile-group-${restoredGroup.id}`).click({ button: "right" });
    await importPage.getByTestId(`profile-group-action-toggle-${restoredGroup.id}`).click();
    await expect.poll(async () => (await extension.manager()).profiles.filter(entry => entry.groupId === restoredGroup.id).map(entry => entry.enabled)).toEqual([true, false]);
    await importPage.close();
  });
});
