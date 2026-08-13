/* eslint-disable max-lines */
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { BrowserContext, Frame, Page, Worker } from "playwright";
import type { Profile, ProfileGroup } from "../src/lib/schema";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { expect } from "vitest";

export interface ProfileManagerValue {
  profileGroups: ProfileGroup[];
  profiles: Profile[];
  selectedProfileId?: string;
}

export interface GuideServer {
  close: () => Promise<void>;
  localhostOrigin: string;
  loopbackOrigin: string;
}

export interface RegisteredRule {
  action: Record<string, unknown>;
  condition: Record<string, unknown>;
  id: number;
  priority: number;
}

let idSequence = 0;

export function nextId() {
  idSequence += 1;
  return `00000000-0000-7000-8000-${idSequence.toString().padStart(12, "0")}`;
}

export function group<T>(items: T[], type: "checkbox" | "radio" = "checkbox") {
  return { id: nextId(), items, type };
}

export function item<T>(value: T) {
  return { enabled: true, id: nextId(), value };
}

export function header(
  name: string,
  operation: "append" | "remove" | "set",
  value = "",
) {
  return operation === "remove"
    ? { enabled: true, id: nextId(), name, operation }
    : { enabled: true, id: nextId(), name, operation, value };
}

export function profile(overrides: Partial<Profile>): Profile {
  return {
    emoji: "🧪",
    enabled: true,
    filters: {},
    id: nextId(),
    name: "E2E guide profile",
    ruleActionType: "modifyHeaders",
    ...overrides,
  };
}

export async function startGuideServer(): Promise<GuideServer> {
  const server = createServer((request, response) => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-expose-headers", "*");
    response.setHeader("cache-control", "no-store");

    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname === "/response") {
      response.setHeader("x-guide-response", "original");
      response.setHeader("x-response-append", "original");
      response.setHeader("x-remove-response", "remove-me");
      response.end("response headers");
      return;
    }

    if (url.pathname === "/redirect-target") {
      response.setHeader("content-type", "text/html");
      response.end("<h1>redirect target</h1>");
      return;
    }

    if (url.pathname === "/allow-frame") {
      response.setHeader("content-type", "text/html");
      response.end("<script src=\"/blocked-child.js\"></script><h1>allowed frame</h1>");
      return;
    }

    if (url.pathname === "/blocked-child.js") {
      response.setHeader("content-type", "text/javascript");
      response.end("window.guideChildLoaded = true;");
      return;
    }

    if (url.pathname === "/inspect-script.js") {
      response.setHeader("content-type", "text/javascript");
      response.end(`window.e2eScriptHeader = ${JSON.stringify(request.headers["x-resource-type"] ?? null)};`);
      return;
    }

    if (url.pathname === "/frame") {
      response.setHeader("content-type", "text/html");
      response.end("<h1>child frame</h1>");
      return;
    }

    if (url.pathname === "/echo" || url.pathname.startsWith("/path/")) {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({
        headers: request.headers,
        method: request.method,
        path: url.pathname,
      }));
      return;
    }

    response.setHeader("content-type", "text/html");
    response.end(`<h1>${url.pathname}</h1>`);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "0.0.0.0", resolve);
  });

  const { port } = server.address() as AddressInfo;
  return {
    close: () => closeServer(server),
    localhostOrigin: `http://localhost:${port}`,
    loopbackOrigin: `http://127.0.0.1:${port}`,
  };
}

async function closeServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}

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
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
        optional_permissions?: string[];
        permissions?: string[];
      };
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
        `--disable-extensions-except=${this.extensionPath}`,
        `--load-extension=${this.extensionPath}`,
      ],
      headless: false,
      viewport: { height: 800, width: 1280 },
    });
    this.worker = this.context.serviceWorkers()[0]
      ?? await this.context.waitForEvent("serviceworker");
    this.extensionId = new URL(this.worker.url()).host;
  }

  async restart() {
    await this.context.close();
    await this.start();
  }

  async close() {
    await this.context?.close();
    if (this.userDataDir) {
      await rm(this.userDataDir, { force: true, recursive: true });
    }
  }

  async openExtensionPage(route = "/profiles") {
    const page = await this.context.newPage();
    await page.goto(`chrome-extension://${this.extensionId}/popup.html#${route}`);
    return page;
  }

  async grantPermission(permission: "cookies" | "tabGroups") {
    const page = await this.openExtensionPage();
    const alreadyGranted = await page.evaluate(async (permissionName) => {
      return await chrome.permissions.contains({ permissions: [permissionName] });
    }, permission);
    if (alreadyGranted) {
      await page.close();
      return;
    }
    await page.evaluate((permissionName) => {
      const button = document.createElement("button");
      button.id = "e2e-permission";
      button.textContent = `Grant ${permissionName}`;
      Object.assign(button.style, {
        height: "40px",
        left: "8px",
        position: "fixed",
        top: "8px",
        width: "180px",
        zIndex: "2147483647",
      });
      button.addEventListener("click", async () => {
        const granted = await chrome.permissions.request({ permissions: [permissionName] });
        document.body.dataset.permissionGranted = String(granted);
      });
      document.body.append(button);
    }, permission);
    await page.locator("#e2e-permission").click();
    await expect.poll(() => page.locator("body").getAttribute("data-permission-granted"))
      .toBe("true");
    await page.close();
  }

  async setProfiles(
    profiles: Profile[],
    expectedRuleCount: number,
    profileGroups: ProfileGroup[] = [],
  ) {
    await this.worker.evaluate(async () => {
      await chrome.storage.local.set({ powerOn: false });
    });
    await expect.poll(() => this.ruleCount()).toBe(0);

    const manager: ProfileManagerValue = {
      profileGroups,
      profiles,
      selectedProfileId: profiles[0]?.id,
    };
    await this.worker.evaluate(async (nextManager) => {
      await chrome.storage.local.set({
        profileId2ErrorMessageRecord: {},
        profileId2RelatedRuleIdRecord: {},
        profileManager: nextManager,
        profileManager$: { v: 4 },
      });
      await chrome.storage.local.set({ powerOn: true });
    }, manager);

    await expect.poll(() => this.ruleCount(), { timeout: 10_000 }).toBe(expectedRuleCount);
  }

  async manager(): Promise<ProfileManagerValue> {
    const manager = await this.worker.evaluate(async () => {
      const result = await chrome.storage.local.get("profileManager");
      return result.profileManager;
    });
    return manager as ProfileManagerValue;
  }

  async updateManager(manager: ProfileManagerValue) {
    await this.worker.evaluate(async (nextManager) => {
      await chrome.storage.local.set({ profileManager: nextManager });
    }, manager);
  }

  async setPower(powerOn: boolean) {
    await this.worker.evaluate(async (value) => {
      await chrome.storage.local.set({ powerOn: value });
    }, powerOn);
  }

  async errors(): Promise<Record<string, string>> {
    const errors = await this.worker.evaluate(async () => {
      const result = await chrome.storage.local.get("profileId2ErrorMessageRecord");
      return result.profileId2ErrorMessageRecord;
    });
    return errors as Record<string, string>;
  }

  async registrations(): Promise<Record<string, { ruleId: number; ruleScope: "dynamic" | "session" }>> {
    const registrations = await this.worker.evaluate(async () => {
      const result = await chrome.storage.local.get("profileId2RelatedRuleIdRecord");
      return result.profileId2RelatedRuleIdRecord;
    });
    return registrations as Record<string, { ruleId: number; ruleScope: "dynamic" | "session" }>;
  }

  async rules(): Promise<RegisteredRule[]> {
    const rules = await this.worker.evaluate(async () => {
      const [dynamicRules, sessionRules] = await Promise.all([
        chrome.declarativeNetRequest.getDynamicRules(),
        chrome.declarativeNetRequest.getSessionRules(),
      ]);
      return [...dynamicRules, ...sessionRules];
    });
    return rules as unknown as RegisteredRule[];
  }

  async removeBrowserRules() {
    await this.worker.evaluate(async () => {
      const [dynamicRules, sessionRules] = await Promise.all([
        chrome.declarativeNetRequest.getDynamicRules(),
        chrome.declarativeNetRequest.getSessionRules(),
      ]);
      await Promise.all([
        chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: dynamicRules.map(rule => rule.id) }),
        chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: sessionRules.map(rule => rule.id) }),
      ]);
    });
  }

  async badgeText() {
    return await this.worker.evaluate(async () => await chrome.action.getBadgeText({}));
  }

  async ruleCount() {
    return await this.worker.evaluate(async () => {
      const [dynamicRules, sessionRules] = await Promise.all([
        chrome.declarativeNetRequest.getDynamicRules(),
        chrome.declarativeNetRequest.getSessionRules(),
      ]);
      return dynamicRules.length + sessionRules.length;
    });
  }

  async tabId(page: Page) {
    const url = page.url();
    return await this.worker.evaluate(async (tabUrl) => {
      const tab = (await chrome.tabs.query({})).find(candidate => candidate.url === tabUrl);
      if (tab?.id === undefined) {
        throw new Error(`Cannot resolve tab ID for ${tabUrl}`);
      }
      return tab.id;
    }, url);
  }
}

export async function fetchEcho(page: Frame | Page, url: string, options?: {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
}) {
  return await page.evaluate(async ({ options: requestOptions, url: requestUrl }) => {
    const response = await fetch(requestUrl, { cache: "no-store", ...requestOptions });
    return await response.json() as {
      headers: Record<string, string | undefined>;
      method: string;
      path: string;
    };
  }, { options, url });
}

export async function fetchResponseHeaders(page: Page, url: string) {
  return await page.evaluate(async (requestUrl) => {
    const response = await fetch(requestUrl, { cache: "no-store" });
    return Object.fromEntries(response.headers.entries());
  }, url);
}

export async function loadInspectionScript(page: Page, url: string) {
  await page.evaluate((scriptUrl) => {
    window.e2eScriptHeader = undefined;
    const script = document.createElement("script");
    script.src = `${scriptUrl}?cache=${crypto.randomUUID()}`;
    document.head.append(script);
  }, url);
  await expect.poll(() => page.evaluate(() => window.e2eScriptHeader)).not.toBeUndefined();
  return await page.evaluate(() => window.e2eScriptHeader);
}

export async function editorText(page: Page) {
  return await page.locator(".cm-content").evaluate(element => element.textContent ?? "");
}

export async function setEditorText(page: Page, text: string) {
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(text);
}

declare global {
  const chrome: {
    action: {
      getBadgeText: (details: Record<string, never>) => Promise<string>;
    };
    declarativeNetRequest: {
      getDynamicRules: () => Promise<Array<{ id: number } & Record<string, unknown>>>;
      getSessionRules: () => Promise<Array<{ id: number } & Record<string, unknown>>>;
      updateDynamicRules: (options: { removeRuleIds: number[] }) => Promise<void>;
      updateSessionRules: (options: { removeRuleIds: number[] }) => Promise<void>;
    };
    permissions: {
      contains: (permissions: { permissions: string[] }) => Promise<boolean>;
      request: (permissions: { permissions: string[] }) => Promise<boolean>;
    };
    storage: {
      local: {
        get: (key: string) => Promise<Record<string, unknown>>;
        set: (values: Record<string, unknown>) => Promise<void>;
      };
    };
    tabs: {
      group: (options: { groupId?: number; tabIds: number[] }) => Promise<number>;
      query: (query: Record<string, unknown>) => Promise<Array<{ id?: number; url?: string }>>;
      ungroup: (tabIds: number | number[]) => Promise<void>;
    };
  };

  interface Window {
    e2eScriptHeader?: string | null;
  }
}
