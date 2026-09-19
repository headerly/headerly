import type { Page } from "playwright";
import { describe, expect, it } from "vitest";
import { setupExtensionSuite } from "../suite";
import { group, header, item, profile } from "../test-util";

async function visibleChineseText(page: Page) {
  return await page.locator("body").evaluate((body) => {
    const chinese = /\p{Script=Han}/u;
    // Exclude only the language control and its portaled options, not its label.
    const languageControl = "[data-testid=\"settings-language\"], [data-testid=\"settings-language-options\"]";
    return Array.from(body.querySelectorAll("*")).flatMap((element) => {
      if (element.closest(languageControl) || !element.checkVisibility({ visibilityProperty: true, opacityProperty: true })) {
        return [];
      }
      const text = Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent)
        .join("");
      return [
        text,
        element.getAttribute("placeholder"),
        element.getAttribute("aria-label"),
        element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element.value : null,
      ].filter(value => value && chinese.test(value)).map(value => `${element.tagName.toLowerCase()}: ${value}`);
    });
  });
}

describe("popup language switching", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("preserves Chinese after switching from English and restarting the browser", async () => {
    const { extension } = state;
    const popup = await extension.openExtensionPage("/settings");
    await popup.getByRole("heading", { name: "Settings", exact: true }).waitFor();
    await expect.poll(() => popup.locator("html").getAttribute("lang")).toBe("en");

    await popup.getByTestId("settings-language").click();
    await popup.getByRole("option", { name: /^中文/ }).click();
    await popup.getByRole("heading", { name: "设置", exact: true }).waitFor();
    await expect.poll(() => popup.locator("html").getAttribute("lang")).toBe("zh-CN");

    // Restart with the same user data directory; the browser itself still uses English.
    await extension.restart();
    const reopened = await extension.openExtensionPage("/settings");
    await reopened.getByRole("heading", { name: "设置", exact: true }).waitFor();
    await expect.poll(() => reopened.locator("html").getAttribute("lang")).toBe("zh-CN");
    await expect.poll(() => reopened.getByTestId("settings-language").textContent()).toMatch(/中文/);
    await expect.poll(() => visibleChineseText(reopened)).not.toEqual([]);
    await reopened.close();
  });

  it("switches English to Chinese and back without Chinese text remaining on any route", async () => {
    const { extension } = state;
    const target = profile({
      name: "Language test profile",
      filters: { requestDomains: group([item("example.com")]) },
      requestHeaderModGroups: [group([header("x-language-test", "set", "english")])],
    });
    await extension.setProfiles([target], 1);
    const popup = await extension.openExtensionPage("/settings");
    await popup.getByRole("heading", { name: "Settings", exact: true }).waitFor();
    await expect.poll(() => popup.locator("html").getAttribute("lang")).toBe("en");
    await expect.poll(() => visibleChineseText(popup)).toEqual([]);

    // Cover every router path, including the root alias and both optional-ID cases.
    const routes = [
      { path: "/", ready: popup.getByTestId("profile-name") },
      { path: "/profiles", ready: popup.getByTestId("profile-name") },
      { path: "/import", ready: popup.getByTestId("import-confirm") },
      { path: "/export", ready: popup.getByTestId("export-menu-trigger") },
      { path: `/export/${target.id}`, ready: popup.locator(".cm-content").filter({ hasText: target.name }) },
      { path: "/settings", ready: popup.getByTestId("settings-language") },
    ] as const;

    for (const language of [
      { locale: "zh-CN", option: /^中文/, heading: "设置" },
      { locale: "en", option: "English", heading: "Settings" },
    ] as const) {
      await popup.getByTestId("settings-language").click();
      await popup.getByRole("option", { name: language.option, exact: true }).click();
      await popup.getByRole("heading", { name: language.heading, exact: true }).waitFor();
      await expect.poll(() => popup.locator("html").getAttribute("lang")).toBe(language.locale);

      for (const route of routes) {
        // Preserve the running SPA so navigation does not hide stale translations by reloading it.
        await popup.evaluate(path => window.location.hash = path, route.path);
        await route.ready.waitFor({ state: "visible" });
        if (language.locale === "en") {
          await expect.poll(() => visibleChineseText(popup), { message: `Chinese text remains on ${route.path}` }).toEqual([]);
        } else {
          // Prove Chinese content was actually rendered and the scanner can detect it.
          await expect.poll(() => visibleChineseText(popup), { message: `No Chinese text rendered on ${route.path}` }).not.toEqual([]);
        }
      }
    }

    // The Chinese language option is allowed even while the rest of the page is English.
    await popup.getByTestId("settings-language").click();
    await popup.getByRole("option", { name: /^中文/ }).waitFor();
    await expect.poll(() => visibleChineseText(popup)).toEqual([]);
    await popup.keyboard.press("Escape");
    await popup.close();
  });
});
