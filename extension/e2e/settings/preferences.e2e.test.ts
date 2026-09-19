import type { Page } from "playwright";
import { describe, expect, it } from "vitest";
import { setupExtensionSuite } from "../suite";
import { group, header, profile } from "../test-util";

async function selectTheme(page: Page, name: "Auto" | "Dark" | "Light") {
  await page.getByTestId("settings-theme").click();
  await page.getByRole("option", { name, exact: true }).click();
  await expect.poll(() => page.getByTestId("settings-theme").textContent()).toContain(name);
}

async function expectDarkTheme(page: Page, dark: boolean) {
  await expect.poll(() => page.locator("html").evaluate(element => element.classList.contains("dark"))).toBe(dark);
}

describe("theme and profile preferences", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("applies Light, Dark and Auto themes and preserves the choice across browser restart", async () => {
    const { extension } = state;
    const settings = await extension.openExtensionPage("/settings");
    await settings.getByTestId("settings-theme").waitFor();
    await expect.poll(() => settings.getByTestId("settings-theme").textContent()).toContain("Auto");
    await settings.emulateMedia({ colorScheme: "dark" });
    await expectDarkTheme(settings, true);
    await settings.emulateMedia({ colorScheme: "light" });
    await expectDarkTheme(settings, false);

    await selectTheme(settings, "Light");
    await settings.emulateMedia({ colorScheme: "dark" });
    await expectDarkTheme(settings, false);
    await selectTheme(settings, "Dark");
    await settings.emulateMedia({ colorScheme: "light" });
    await expectDarkTheme(settings, true);

    await extension.restart();
    const reopened = await extension.openExtensionPage("/settings");
    await reopened.emulateMedia({ colorScheme: "light" });
    await expect.poll(() => reopened.getByTestId("settings-theme").textContent()).toContain("Dark");
    await expectDarkTheme(reopened, true);
    await selectTheme(reopened, "Auto");
    await expectDarkTheme(reopened, false);
    await reopened.emulateMedia({ colorScheme: "dark" });
    await expectDarkTheme(reopened, true);
    await reopened.close();
  });

  it("moves field comments between inline buttons and the menu without losing edits", async () => {
    const { extension } = state;
    await extension.setProfiles([profile({
      requestHeaderModGroups: [group([{ ...header("x-comment", "set", "value"), comments: "Original note" }])],
    })], 1);
    const popup = await extension.openExtensionPage();
    const fields = popup.locator("fieldset").filter({ has: popup.getByTestId("fieldset-name").filter({ hasText: /^Request Headers$/ }) });
    await fields.getByPlaceholder("Name", { exact: true }).waitFor();
    const settings = await extension.openExtensionPage("/settings");
    const toggle = settings.getByTestId("settings-showCommentsInline");
    await expect.poll(() => toggle.isChecked()).toBe(false);
    expect(await fields.getByRole("button", { name: "Comments", exact: true }).count()).toBe(0);
    await fields.getByRole("button", { name: "More options", exact: true }).click();
    await popup.getByRole("menuitem", { name: "Comments", exact: true }).waitFor();
    await popup.keyboard.press("Escape");

    await toggle.click();
    await expect.poll(() => toggle.isChecked()).toBe(true);
    await fields.getByRole("button", { name: "Comments", exact: true }).click();
    await expect.poll(() => popup.getByTestId("profile-comments-input").inputValue()).toBe("Original note");
    await popup.getByTestId("profile-comments-input").fill("Edited inline note");
    await popup.getByTestId("profile-comments-save").click();
    await expect.poll(async () => (await extension.manager()).profiles[0]?.requestHeaderModGroups?.[0]?.items[0]?.comments)
      .toBe("Edited inline note");
    await fields.getByRole("button", { name: "More options", exact: true }).click();
    await popup.getByRole("menuitem", { name: "Duplicate", exact: true }).waitFor();
    expect(await popup.getByRole("menuitem", { name: "Comments", exact: true }).count()).toBe(0);
    await popup.keyboard.press("Escape");

    await settings.reload();
    await expect.poll(() => toggle.isChecked()).toBe(true);
    await popup.reload();
    await fields.getByRole("button", { name: "Comments", exact: true }).waitFor();
    await toggle.click();
    await expect.poll(() => toggle.isChecked()).toBe(false);
    await expect.poll(() => fields.getByRole("button", { name: "Comments", exact: true }).count()).toBe(0);
    await fields.getByRole("button", { name: "More options", exact: true }).click();
    await popup.getByRole("menuitem", { name: "Comments", exact: true }).click();
    await expect.poll(() => popup.getByTestId("profile-comments-input").inputValue()).toBe("Edited inline note");
    await popup.close();
    await settings.close();
  });

  it("changes the recent header count from 1 to 20 and persists it across reloads", async () => {
    const { extension } = state;
    await extension.setProfiles([profile({
      requestHeaderModGroups: [group([header("x-original", "set", "value")])],
      responseHeaderModGroups: [group([header("x-response", "set", "value")])],
    })], 1);
    const popup = await extension.openExtensionPage();
    await popup.evaluate(() => {
      for (const type of ["request", "response"])
        localStorage.setItem(`recent-${type}-header-names`, JSON.stringify(Array.from({ length: 20 }, (_, index) => `x-${type}-${index}`)));
    });
    await popup.reload();
    const shortcuts = popup.getByRole("button", { name: /^Add x-(request|response)-\d+ header$/ });
    await expect.poll(() => shortcuts.count()).toBe(6);
    const settings = await extension.openExtensionPage("/settings");
    const count = settings.getByTestId("settings-recentlyAddedCount");
    await expect.poll(() => count.textContent()).toBe("3");
    await count.click();
    expect(await settings.getByRole("option").count()).toBe(20);
    await settings.getByRole("option", { name: "1", exact: true }).click();
    await expect.poll(() => shortcuts.count()).toBe(2);
    await count.click();
    await settings.getByRole("option", { name: "20", exact: true }).click();
    await expect.poll(() => shortcuts.count()).toBe(40);
    await settings.reload();
    await expect.poll(() => count.textContent()).toBe("20");
    await popup.reload();
    await expect.poll(() => shortcuts.count()).toBe(40);
    await popup.close();
    await settings.close();
  });

  it("hides and restores recent request and response headers without deleting history or fields", async () => {
    const { extension } = state;
    await extension.setProfiles([profile({
      requestHeaderModGroups: [group([header("x-request-original", "set", "request-value")])],
      responseHeaderModGroups: [group([header("x-response-original", "set", "response-value")])],
    })], 1);
    const popup = await extension.openExtensionPage();
    const requestFields = popup.locator("fieldset").filter({ has: popup.getByTestId("fieldset-name").filter({ hasText: /^Request Headers$/ }) });
    const responseFields = popup.locator("fieldset").filter({ has: popup.getByTestId("fieldset-name").filter({ hasText: /^Response Headers$/ }) });
    // Populate history through real edits; mounting an existing profile must not create it.
    await requestFields.getByPlaceholder("Name", { exact: true }).fill("x-request-recent");
    await responseFields.getByPlaceholder("Name", { exact: true }).fill("x-response-recent");
    const requestShortcut = popup.getByRole("button", { name: "Add x-request-recent header", exact: true });
    const responseShortcut = popup.getByRole("button", { name: "Add x-response-recent header", exact: true });
    await requestShortcut.waitFor();
    await responseShortcut.waitFor();
    const settings = await extension.openExtensionPage("/settings");
    const toggle = settings.getByTestId("settings-hideRecentlyAdded");
    await expect.poll(() => toggle.isChecked()).toBe(false);
    await toggle.click();
    await expect.poll(() => toggle.isChecked()).toBe(true);
    await requestShortcut.waitFor({ state: "hidden" });
    await responseShortcut.waitFor({ state: "hidden" });

    await settings.reload();
    await expect.poll(() => toggle.isChecked()).toBe(true);
    await popup.reload();
    await requestFields.getByPlaceholder("Name", { exact: true }).waitFor();
    expect(await requestShortcut.count()).toBe(0);
    expect(await responseShortcut.count()).toBe(0);
    expect(await requestFields.getByPlaceholder("Name", { exact: true }).inputValue()).toBe("x-request-recent");
    expect(await responseFields.getByPlaceholder("Name", { exact: true }).inputValue()).toBe("x-response-recent");
    expect(await requestFields.getByPlaceholder("Value", { exact: true }).inputValue()).toBe("request-value");
    expect(await responseFields.getByPlaceholder("Value", { exact: true }).inputValue()).toBe("response-value");

    await toggle.click();
    await expect.poll(() => toggle.isChecked()).toBe(false);
    await requestShortcut.waitFor();
    await responseShortcut.waitFor();
    await requestShortcut.click();
    await expect.poll(() => requestFields.getByPlaceholder("Name", { exact: true }).count()).toBe(2);
    await popup.close();
    await settings.close();
  });
});
