import type { Locator } from "playwright";
import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";
import { setupExtensionSuite } from "../suite";
import { profile } from "../test-util";

async function isInScrollViewport(locator: Locator) {
  return locator.evaluate((element) => {
    let container = element.parentElement;
    while (container && getComputedStyle(container).overflowY !== "auto") {
      container = container.parentElement;
    }
    if (!container)
      return false;
    const bounds = element.getBoundingClientRect();
    const viewport = container.getBoundingClientRect();
    return bounds.top >= viewport.top && bounds.bottom <= viewport.bottom;
  });
}

describe("sidebar template references", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it.each([false, true])("scrolls to standalone and grouped profiles (grouped: %s)", async (grouped) => {
    const { extension } = state;
    const groupId = uuidv7();
    const first = profile({ name: "First", enabled: false });
    const target = profile({ name: "Scroll target", enabled: false, ...(grouped ? { groupId } : {}) });
    const profiles = [first, ...Array.from({ length: 40 }, () => profile({ enabled: false })), target];
    await extension.setProfiles(profiles, 0, grouped
      ? [{ id: groupId, name: "Last group", color: "#8ab4f8", type: "checkbox" }]
      : []);
    await extension.updateManager({ ...await extension.manager(), selectedProfileId: target.id });

    const popup = await extension.openExtensionPage();
    await expect.poll(() => isInScrollViewport(popup.getByTestId(`profile-${target.id}`))).toBe(true);
    await extension.updateManager({ ...await extension.manager(), selectedProfileId: first.id });
    await expect.poll(() => isInScrollViewport(popup.getByTestId(`profile-${first.id}`))).toBe(true);
    await extension.updateManager({ ...await extension.manager(), selectedProfileId: target.id });
    await expect.poll(() => isInScrollViewport(popup.getByTestId(`profile-${target.id}`))).toBe(true);
    await popup.close();

    const exportPage = await extension.openExtensionPage(`/export/${target.id}`);
    await expect.poll(() => isInScrollViewport(exportPage.getByTestId(`export-profile-${target.id}`))).toBe(true);
    await exportPage.close();
  });

  it("opens the newly created group's menu with an existing group present", async () => {
    const { extension } = state;
    const groupId = uuidv7();
    const target = profile({ name: "Create a group", enabled: false });
    await extension.setProfiles([profile({ groupId, enabled: false }), target], 0, [
      { id: groupId, name: "Existing group", color: "#8ab4f8", type: "checkbox" },
    ]);
    const popup = await extension.openExtensionPage();
    await popup.getByTestId(`profile-${target.id}`).click({ button: "right" });
    await popup.getByTestId("profile-action-addToGroup").hover();
    await popup.getByTestId("profile-action-createNewGroup").click();
    await expect.poll(async () => (await extension.manager()).profileGroups).toHaveLength(2);
    const newGroup = (await extension.manager()).profileGroups.find(group => group.id !== groupId)!;
    await expect.poll(() => popup.getByTestId(`profile-group-name-${newGroup.id}`).isVisible()).toBe(true);
    await popup.close();
  });
});
