import { describe, expect, it } from "vitest";
import { group, item, profile } from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

describe("documented redirect, block, allow, upgrade, and frame actions", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("blocks a matching request and shows that a conditionless block is global", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([profile({ ruleActionType: "block" })], 1);

    await expect(page.goto(`${server.loopbackOrigin}/blocked-globally`))
      .rejects
      .toThrow(/ERR_BLOCKED_BY_CLIENT/);
    await extension.setProfiles([], 0);
    await page.goto(`${server.loopbackOrigin}/works-again`);
    await page.close();
  });

  it("lets equal-priority allow take precedence over block for one request", async () => {
    const { extension, server } = state;
    const allowedUrl = `${server.loopbackOrigin}/allowed`;
    await extension.setProfiles([
      profile({
        filters: { requestDomains: group([item("127.0.0.1")]) },
        priority: 1,
        ruleActionType: "block",
      }),
      profile({
        filters: { urlFilter: [item(`|${allowedUrl}|`)] },
        priority: 1,
        ruleActionType: "allow",
      }),
    ], 2);

    const page = await extension.context.newPage();
    await page.goto(allowedUrl);
    await expect(page.locator("h1").textContent()).resolves.toBe("/allowed");
    await expect(page.goto(`${server.loopbackOrigin}/still-blocked`))
      .rejects
      .toThrow(/ERR_BLOCKED_BY_CLIENT/);
    await page.close();
  });

  it("allows a complete frame hierarchy with allowAllRequests", async () => {
    const { extension, server } = state;
    const frameUrl = `${server.loopbackOrigin}/allow-frame`;
    await extension.setProfiles([
      profile({
        filters: { requestDomains: group([item("127.0.0.1")]) },
        priority: 1,
        ruleActionType: "block",
      }),
      profile({
        filters: {
          resourceTypes: group([item(["main_frame"])]),
          urlFilter: [item(`|${frameUrl}|`)],
        },
        priority: 2,
        ruleActionType: "allowAllRequests",
      }),
    ], 2);

    const page = await extension.context.newPage();
    await page.goto(frameUrl);
    await expect.poll(() => page.evaluate(() => window.guideChildLoaded)).toBe(true);
    await page.close();
  });

  it("rejects allowAllRequests without a valid frame resource type", async () => {
    const { extension } = state;
    const missingType = profile({ ruleActionType: "allowAllRequests" });
    const invalidType = profile({
      filters: { resourceTypes: group([item(["script"])]) },
      ruleActionType: "allowAllRequests",
    });
    await extension.setProfiles([missingType, invalidType], 0);

    await expect.poll(async () => Object.keys(await extension.errors()).sort())
      .toEqual([invalidType.id, missingType.id].sort());
  });

  it("redirects one exact complete URL to the trimmed fixed destination", async () => {
    const { extension, server } = state;
    const source = `${server.loopbackOrigin}/redirect-source`;
    const target = `${server.loopbackOrigin}/redirect-target`;
    await extension.setProfiles([profile({
      filters: { urlFilter: [item(`|${source}|`)] },
      redirectUrlGroup: [
        { ...item(""), enabled: false },
        item(`  ${target}  `),
      ],
      ruleActionType: "redirect",
    })], 1);

    const page = await extension.context.newPage();
    await page.goto(source);
    await expect.poll(() => page.url()).toBe(target);
    await expect(page.locator("h1").textContent()).resolves.toBe("redirect target");
    await page.close();
  });

  it("does not register an empty redirect and records an invalid destination error", async () => {
    const { extension } = state;
    const empty = profile({
      redirectUrlGroup: [item("   ")],
      ruleActionType: "redirect",
    });
    const invalid = profile({
      redirectUrlGroup: [item("javascript:alert(1)")],
      ruleActionType: "redirect",
    });
    await extension.setProfiles([empty, invalid], 0);

    await expect.poll(async () => (await extension.errors())[invalid.id]).toMatch(/redirect|url/i);
    expect((await extension.errors())[empty.id]).toBeUndefined();
    expect((await extension.registrations())[empty.id]).toBeUndefined();
  });

  it("upgrades HTTP to HTTPS while preserving host, path, and query", async () => {
    const { extension } = state;
    await extension.context.route("https://upgrade.test/**", async route => route.fulfill({
      body: "<h1>secure destination</h1>",
      contentType: "text/html",
    }));
    await extension.setProfiles([profile({
      filters: { requestDomains: group([item("upgrade.test")]) },
      ruleActionType: "upgradeScheme",
    })], 1);

    const page = await extension.context.newPage();
    await page.goto("http://upgrade.test/path/to/resource?mode=e2e");
    expect(page.url()).toBe("https://upgrade.test/path/to/resource?mode=e2e");
    await expect(page.locator("h1").textContent()).resolves.toBe("secure destination");
    await page.close();
  });
});

declare global {
  interface Window {
    guideChildLoaded?: boolean;
  }
}
