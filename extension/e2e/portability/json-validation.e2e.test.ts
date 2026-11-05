import { describe, expect, it } from "vitest";
import { setupExtensionSuite } from "../suite";
import { profile, setEditorText } from "../test-util";

describe("jSON editor validation feedback", { concurrent: false }, () => {
  const state = setupExtensionSuite();
  const member = { name: "Member", emoji: "", enabled: true, ruleActionType: "block", filters: {} };

  it("shows every schema/custom error on hover and hides the indicator after correction", async () => {
    await state.extension.setProfiles([profile({ enabled: false })], 0);
    const page = await state.extension.openExtensionPage("/import");
    const indicator = page.getByTestId("json-validation-errors");
    const tooltip = page.getByTestId("json-validation-errors-tooltip");
    await expect.poll(() => indicator.count()).toBe(0);
    const group = { kind: "group", name: "Radio", color: "#000", type: "radio", profiles: [member, member] };
    await setEditorText(page, JSON.stringify({ version: 2, items: [group, group] }));
    await indicator.hover();
    await expect.poll(() => tooltip.isVisible()).toBe(true);
    expect(await tooltip.locator("li").count()).toBe(2);
    expect(await tooltip.textContent()).toContain("$.items[0].profiles");
    expect(await tooltip.textContent()).toContain("$.items[1].profiles");
    expect(await tooltip.textContent()).toContain("A radio group can have at most one enabled profile");
    expect(await page.getByTestId("import-confirm").isDisabled()).toBe(true);

    await setEditorText(page, JSON.stringify({ version: 2, items: [{ kind: "profile", profile: { ...member, name: 1, emoji: false } }] }));
    await indicator.hover();
    await expect.poll(() => tooltip.textContent()).toContain("$.items[0].profile.name");
    expect(await tooltip.textContent()).toContain("$.items[0].profile.emoji");
    expect(await tooltip.locator("li").count()).toBe(2);

    await setEditorText(page, JSON.stringify({ version: 1, profiles: [{ ...member, requestHeaderModGroups: [{ type: "checkbox", items: [{ enabled: true, name: 1, operation: "set", value: false }] }] }] }));
    await indicator.hover();
    await expect.poll(() => tooltip.textContent()).toContain("$.profiles[0].requestHeaderModGroups[0].items[0].name");
    expect(await tooltip.textContent()).toContain("$.profiles[0].requestHeaderModGroups[0].items[0].value");

    await setEditorText(page, JSON.stringify({ version: 2, items: [{ ...group, profiles: [{ ...member, enabled: false }] }] }));
    await expect.poll(() => indicator.count()).toBe(0);
    expect(await page.getByTestId("import-confirm").isEnabled()).toBe(true);
    await page.close();
  });

  it("shows empty and radio-count errors for nested groups, including unfinished local exports", async () => {
    const target = profile({ enabled: false, requestHeaderModGroups: [{ id: "550e8400-e29b-41d4-a716-446655440001", type: "checkbox", items: [] }] });
    await state.extension.setProfiles([target], 0);
    const page = await state.extension.openExtensionPage(`/export/${target.id}`);
    const indicator = page.getByTestId("json-validation-errors");
    const tooltip = page.getByTestId("json-validation-errors-tooltip");
    await indicator.hover();
    await expect.poll(() => tooltip.textContent()).toContain("$.items[0].profile.requestHeaderModGroups[0].items");
    expect(await tooltip.textContent()).toContain("A group must contain at least one item");
    expect(await page.getByTestId("export-menu-trigger").isDisabled()).toBe(true);

    await page.goto(`chrome-extension://${state.extension.extensionId}/popup.html#/import`);
    const data = { ...member, requestHeaderModGroups: [{ type: "checkbox", items: [] }], syncCookieGroups: [{ type: "radio", items: [] }], filters: { requestDomains: { type: "radio", items: [{ enabled: true, value: "a.com" }, { enabled: true, value: "b.com" }] } } };
    await setEditorText(page, JSON.stringify({ version: 2, items: [{ kind: "profile", profile: data }] }));
    await indicator.hover();
    await expect.poll(() => tooltip.locator("li").count()).toBe(3);
    expect(await tooltip.textContent()).toContain("$.items[0].profile.syncCookieGroups[0].items");
    expect(await tooltip.textContent()).toContain("$.items[0].profile.filters.requestDomains.items");
    expect(await tooltip.textContent()).toContain("A radio group can have at most one enabled item");
    expect(await page.getByTestId("import-confirm").isDisabled()).toBe(true);
    await page.close();
  });

  it("reports syntax and version errors and also validates edited exports", async () => {
    const target = profile({ enabled: false });
    await state.extension.setProfiles([target], 0);
    const page = await state.extension.openExtensionPage(`/export/${target.id}`);
    await setEditorText(page, "{");
    const indicator = page.getByTestId("json-validation-errors");
    const tooltip = page.getByTestId("json-validation-errors-tooltip");
    await indicator.hover();
    await expect.poll(() => tooltip.isVisible()).toBe(true);
    expect(await tooltip.locator("li").count()).toBe(1);
    expect(await page.getByTestId("export-menu-trigger").isDisabled()).toBe(true);
    await setEditorText(page, JSON.stringify({ version: 999, items: [] }));
    await indicator.focus();
    await expect.poll(() => tooltip.textContent()).toContain("$.version");
    await page.close();
  });
});
