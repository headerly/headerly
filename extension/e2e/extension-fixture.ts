import type { BrowserContext, Page, Worker } from "playwright";
import type { Profile, ProfileGroup } from "../src/lib/schema";
import type { ProfileManager } from "../src/lib/types";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { expect } from "vitest";
import { z } from "zod";

export class ExtensionSession {
  context!: BrowserContext;
  extensionId = "";
  worker!: Worker;
  private extensionPath = "";
  private userDataDir = "";

  async start() {
    this.userDataDir ||= await mkdtemp(join(tmpdir(), "headerly-e2e-"));
    const productionExtensionPath = process.env.HEADERLY_EXTENSION_PATH;
    if (!productionExtensionPath) {
      throw new Error("HEADERLY_EXTENSION_PATH is not configured");
    }
    if (!this.extensionPath) {
      // Browser-owned optional-permission prompts cannot be controlled in headless
      // mode. Promote them only in the temporary copy used by E2E tests.
      this.extensionPath = join(this.userDataDir, "extension-under-test");
      await cp(productionExtensionPath, this.extensionPath, { recursive: true });
      const manifestPath = join(this.extensionPath, "manifest.json");
      const manifest = z.looseObject({
        optional_permissions: z.array(z.string()).optional(),
        permissions: z.array(z.string()).optional(),
      }).parse(JSON.parse(await readFile(manifestPath, "utf8")));
      manifest.permissions = [...new Set([
        ...(manifest.permissions ?? []),
        ...(manifest.optional_permissions ?? []),
      ])];
      delete manifest.optional_permissions;
      await writeFile(manifestPath, JSON.stringify(manifest));
    }

    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      args: [
        "--headless=new",
        "--lang=en-US",
        `--disable-extensions-except=${this.extensionPath}`,
        `--load-extension=${this.extensionPath}`,
      ],
      headless: false,
      locale: "en-US",
      viewport: { height: 800, width: 1280 },
    });
    this.context.setDefaultTimeout(10_000);
    this.context.setDefaultNavigationTimeout(15_000);
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    this.worker = this.context.serviceWorkers()[0]
      ?? await this.context.waitForEvent("serviceworker");
    this.extensionId = new URL(this.worker.url()).host;
    await expect.poll(() => this.worker.evaluate(async () => {
      const stored = await browser.storage.session.get("headerlyTabSessionInitialized");
      return stored.headerlyTabSessionInitialized;
    })).toBe(true);
  }

  async restart() {
    await this.context.close();
    await this.start();
  }

  async close() {
    try {
      await this.context?.close();
    } finally {
      if (this.userDataDir) {
        await rm(this.userDataDir, { force: true, recursive: true });
      }
    }
  }

  async openExtensionPage(route = "/profiles") {
    const page = await this.context.newPage();
    await page.goto(`chrome-extension://${this.extensionId}/popup.html#${route}`);
    return page;
  }

  async setProfiles(
    profiles: Profile[],
    expectedRuleCount: number,
    profileGroups: ProfileGroup[] = [],
  ) {
    await this.worker.evaluate(async () => {
      await browser.storage.local.set({ powerOn: false });
    });
    await expect.poll(() => this.ruleCount()).toBe(0);
    await expect.poll(() => this.registrations()).toEqual({});
    await expect.poll(() => this.badgeText()).toBe("❚❚");

    const manager = {
      profileGroups,
      profiles,
      selectedProfileId: profiles[0]?.id ?? "",
    } as const satisfies ProfileManager;
    await this.worker.evaluate(async (nextManager) => {
      await browser.storage.local.set({
        profileManager: nextManager,
        profileManager$: { v: 4 },
      });
      await browser.storage.local.set({ powerOn: true });
    }, manager);

    await expect.poll(() => this.ruleCount(), { timeout: 10_000 }).toBe(expectedRuleCount);
    await expect.poll(async () => Object.keys(await this.registrations())).toHaveLength(expectedRuleCount);
    // Even zero-rule setups must wait for the power-on watcher to finish.
    await expect.poll(() => this.badgeText()).toBe(expectedRuleCount > 0 ? String(expectedRuleCount) : "");
  }

  async manager() {
    const manager = await this.worker.evaluate(async () => {
      const result = await browser.storage.local.get<{ profileManager: ProfileManager }>("profileManager");
      return result.profileManager;
    });
    return manager;
  }

  async updateManager(manager: ProfileManager) {
    await this.worker.evaluate(async (nextManager) => {
      await browser.storage.local.set({ profileManager: nextManager });
    }, manager);
  }

  async setPower(powerOn: boolean) {
    await this.worker.evaluate(async (value) => {
      await browser.storage.local.set({ powerOn: value });
    }, powerOn);
  }

  async errors() {
    const errors = await this.worker.evaluate(async () => {
      const result = await browser.storage.local.get("profileId2ErrorMessageRecord");
      return result.profileId2ErrorMessageRecord;
    });
    return z.record(z.string(), z.string()).parse(errors ?? {});
  }

  async registrations() {
    const registrations = await this.worker.evaluate(async () => {
      const result = await browser.storage.local.get("profileId2RelatedRuleIdRecord");
      return result.profileId2RelatedRuleIdRecord;
    });
    return z.record(z.string(), z.object({
      ruleId: z.number(),
      ruleScope: z.enum(["dynamic", "session"]),
    })).parse(registrations ?? {});
  }

  async rules() {
    const rules = await this.worker.evaluate(async () => {
      const [dynamicRules, sessionRules] = await Promise.all([
        browser.declarativeNetRequest.getDynamicRules(),
        browser.declarativeNetRequest.getSessionRules(),
      ]);
      return [...dynamicRules, ...sessionRules];
    });
    return rules;
  }

  async removeBrowserRules() {
    await this.worker.evaluate(async () => {
      const [dynamicRules, sessionRules] = await Promise.all([
        browser.declarativeNetRequest.getDynamicRules(),
        browser.declarativeNetRequest.getSessionRules(),
      ]);
      await Promise.all([
        browser.declarativeNetRequest.updateDynamicRules({ removeRuleIds: dynamicRules.map(rule => rule.id) }),
        browser.declarativeNetRequest.updateSessionRules({ removeRuleIds: sessionRules.map(rule => rule.id) }),
      ]);
    });
  }

  async badgeText() {
    return await this.worker.evaluate(async () => await browser.action.getBadgeText({}));
  }

  async ruleCount() {
    return await this.worker.evaluate(async () => {
      const [dynamicRules, sessionRules] = await Promise.all([
        browser.declarativeNetRequest.getDynamicRules(),
        browser.declarativeNetRequest.getSessionRules(),
      ]);
      return dynamicRules.length + sessionRules.length;
    });
  }

  async tabId(page: Page) {
    const url = page.url();
    return await this.worker.evaluate(async (tabUrl) => {
      const tab = (await browser.tabs.query({})).find(candidate => candidate.url === tabUrl);
      if (tab?.id === undefined) {
        throw new Error(`Cannot resolve tab ID for ${tabUrl}`);
      }
      return tab.id;
    }, url);
  }
}
