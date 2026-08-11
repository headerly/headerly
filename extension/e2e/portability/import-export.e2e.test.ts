import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  editorText,
  group,
  header,
  item,
  nextId,
  profile,
  setEditorText,
} from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

function portableProfile() {
  return profile({
    comments: "comments remain visible",
    groupId: nextId(),
    filters: {
      requestDomains: group([item("example.com")]),
      tabGroups: group([item([{ groupId: 456, tabIds: [123] }])]),
      tabIds: group([item([123])]),
    },
    name: "Portable profile",
    requestHeaderModGroups: [group([header("authorization", "set", "Bearer preserved")])],
    syncCookieGroups: [group([{
      domain: ".example.com",
      enabled: true,
      id: nextId(),
      name: "session",
      path: "/admin",
      value: "must-not-export",
    }])],
  });
}

async function exportedJson(page: Parameters<typeof editorText>[0]) {
  await expect.poll(() => editorText(page)).toContain("Portable profile");
  return JSON.parse(await editorText(page)) as {
    profiles: Array<Record<string, unknown>>;
    version: number;
  };
}

describe("documented import, export, download, and share behavior", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("removes local IDs, group membership, and temporary tab conditions from exports", async () => {
    const { extension } = state;
    const target = portableProfile();
    const groupId = target.groupId!;
    await extension.setProfiles([target], 1, [{
      color: "#8ab4f8",
      id: groupId,
      name: "Local-only group",
      type: "checkbox",
    }]);
    const exportPage = await extension.openExtensionPage(`/export/${target.id}`);
    const exported = await exportedJson(exportPage);
    const serialized = JSON.stringify(exported);

    expect(exported.version).toBe(1);
    expect(serialized).not.toContain("\"id\"");
    expect(serialized).not.toContain("groupId");
    expect(serialized).not.toContain("tabIds");
    expect(serialized).not.toContain("tabGroups");
    expect(serialized).not.toContain("Local-only group");
    await exportPage.close();
  });

  it("redacts cookie values but retains identity and other user-authored secrets", async () => {
    const { extension } = state;
    const target = portableProfile();
    await extension.setProfiles([target], 1);
    const exportPage = await extension.openExtensionPage(`/export/${target.id}`);
    const exported = await exportedJson(exportPage);
    const serialized = JSON.stringify(exported);

    expect(serialized).not.toContain("must-not-export");
    expect(serialized).toContain(".example.com");
    expect(serialized).toContain("/admin");
    expect(serialized).toContain("session");
    expect(serialized).toContain("Bearer preserved");
    expect(serialized).toContain("comments remain visible");
    await exportPage.close();
  });

  it("preserves redirect destinations in exported profiles", async () => {
    const { extension } = state;
    const redirect = profile({
      name: "Portable redirect",
      redirectUrlGroup: [item("https://private.example.test/destination?token=visible")],
      ruleActionType: "redirect",
    });
    await extension.setProfiles([redirect], 1);
    const exportPage = await extension.openExtensionPage(`/export/${redirect.id}`);
    await expect.poll(() => editorText(exportPage)).toContain("Portable redirect");
    expect(await editorText(exportPage)).toContain("https://private.example.test/destination?token=visible");
    await exportPage.close();
  });

  it("copies JSON and downloads the same profile exchange", async () => {
    const { extension } = state;
    const target = portableProfile();
    await extension.setProfiles([target], 1);
    const exportPage = await extension.openExtensionPage(`/export/${target.id}`);
    const exported = await exportedJson(exportPage);
    await exportPage.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (value: string) => window.e2eClipboard = value },
      });
    });

    await exportPage.getByTestId("export-menu-trigger").click();
    await exportPage.getByTestId("export-copy-json").click();
    await expect.poll(() => exportPage.evaluate(() => window.e2eClipboard)).toContain("Portable profile");
    expect(JSON.parse(await exportPage.evaluate(() => window.e2eClipboard))).toEqual(exported);

    await exportPage.reload();
    await expect.poll(() => editorText(exportPage)).toContain("Portable profile");
    await exportPage.getByTestId("export-menu-trigger").click();
    const downloadPromise = exportPage.waitForEvent("download");
    await exportPage.getByTestId("export-download-json").click();
    const download = await downloadPromise;
    expect(JSON.parse(await readFile(await download.path(), "utf8"))).toEqual(exported);
    await exportPage.close();
  });

  it("opens compressed share links in Headerly's Import page", async () => {
    const { extension } = state;
    const target = portableProfile();
    await extension.setProfiles([target], 1);
    const exportPage = await extension.openExtensionPage(`/export/${target.id}`);
    await exportedJson(exportPage);
    await exportPage.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (value: string) => window.e2eClipboard = value },
      });
    });
    await exportPage.getByTestId("export-menu-trigger").click();
    await exportPage.getByTestId("export-copy-link").click();
    await expect.poll(() => exportPage.evaluate(() => window.e2eClipboard))
      .toMatch(/^https:\/\/headerly\.dev\/share\?profiles=/);
    const shareLink = await exportPage.evaluate(() => window.e2eClipboard);
    expect(shareLink).not.toContain("Bearer%20preserved");
    await exportPage.close();

    await extension.context.route("https://headerly.dev/share*", async route => route.fulfill({
      body: "<!doctype html><title>Headerly share</title>",
      contentType: "text/html",
    }));
    const sharePage = await extension.context.newPage();
    await sharePage.goto(shareLink);
    await expect.poll(() => sharePage.url())
      .toContain(`chrome-extension://${extension.extensionId}/popup.html#/import`);
    await expect.poll(() => editorText(sharePage)).toContain("Portable profile");
    await sharePage.close();
  });

  it("imports pasted JSON with fresh IDs without overwriting same-name profiles", async () => {
    const { extension } = state;
    const existing = portableProfile();
    await extension.setProfiles([existing], 1);
    const exportPage = await extension.openExtensionPage(`/export/${existing.id}`);
    const exported = await exportedJson(exportPage);
    await exportPage.close();

    const importPage = await extension.openExtensionPage("/import");
    await setEditorText(importPage, JSON.stringify(exported));
    await importPage.getByTestId("import-confirm").click();
    await expect.poll(async () => (await extension.manager()).profiles).toHaveLength(2);
    const profiles = (await extension.manager()).profiles;
    expect(profiles.map(entry => entry.name)).toEqual(["Portable profile", "Portable profile"]);
    expect(profiles[1]?.id).not.toBe(existing.id);
    expect(profiles[1]?.requestHeaderModGroups?.[0]?.id).not.toBe(existing.requestHeaderModGroups?.[0]?.id);
    expect(profiles[1]?.syncCookieGroups?.[0]?.items[0]?.value).toBe("");
  });

  it("loads profile JSON from a file before confirmation", async () => {
    const { extension } = state;
    const target = portableProfile();
    await extension.setProfiles([target], 1);
    const exportPage = await extension.openExtensionPage(`/export/${target.id}`);
    const exported = await exportedJson(exportPage);
    await exportPage.close();
    exported.profiles[0]!.name = "Imported from file";

    const importPage = await extension.openExtensionPage("/import");
    await importPage.getByTestId("import-file-input").setInputFiles({
      buffer: Buffer.from(JSON.stringify(exported)),
      mimeType: "application/json",
      name: "headerly-profiles.json",
    });
    await expect.poll(() => editorText(importPage)).toContain("Imported from file");
    expect(await importPage.getByTestId("import-confirm").isEnabled()).toBe(true);
    await importPage.getByTestId("import-confirm").click();
    await expect.poll(async () => (await extension.manager()).profiles.some(entry => entry.name === "Imported from file"))
      .toBe(true);
  });

  it("keeps confirmation disabled for malformed JSON or the wrong exchange schema", async () => {
    const { extension } = state;
    await extension.setProfiles([], 0);
    const importPage = await extension.openExtensionPage("/import");
    await setEditorText(importPage, "not-json");
    expect(await importPage.getByTestId("import-confirm").isDisabled()).toBe(true);
    expect(await importPage.getByTestId("import-beautify").isDisabled()).toBe(true);

    await setEditorText(importPage, JSON.stringify({ profiles: [], version: 999 }));
    expect(await importPage.getByTestId("import-beautify").isEnabled()).toBe(true);
    expect(await importPage.getByTestId("import-confirm").isDisabled()).toBe(true);
    await importPage.close();
  });
});

declare global {
  interface Window {
    e2eClipboard: string;
  }
}
