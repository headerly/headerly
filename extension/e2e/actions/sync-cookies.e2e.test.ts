import { describe, expect, it } from "vitest";
import { fetchEcho, group, item, nextId, profile } from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

function syncCookie(domain: string, path: string, name: string, value = "") {
  return { domain, enabled: true, id: nextId(), name, path, value };
}

describe("documented synchronized-cookie behavior", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("loads an existing cookie and appends it to independently selected target requests", async () => {
    const { extension, server } = state;
    await extension.context.addCookies([{
      domain: "source.example.test",
      name: "source_session",
      path: "/",
      value: "local-secret",
    }]);
    await extension.setProfiles([profile({
      filters: { requestDomains: group([item("localhost")]) },
      syncCookieGroups: [group([syncCookie("source.example.test", "/", "source_session")])],
    })], 1);

    const page = await extension.context.newPage();
    await page.goto(`${server.localhostOrigin}/page`);
    expect((await fetchEcho(page, `${server.localhostOrigin}/echo`)).headers.cookie)
      .toContain("source_session=local-secret");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers.cookie)
      .toBeUndefined();
    await page.close();
  });

  it("uses the exact domain, path, and name identity", async () => {
    const { extension } = state;
    await extension.context.addCookies([
      { domain: "identity.example.test", name: "session", path: "/", value: "root" },
      { domain: "identity.example.test", name: "session", path: "/admin", value: "admin" },
      { domain: ".example.test", name: "session", path: "/", value: "domain-cookie" },
    ]);
    await extension.setProfiles([profile({
      syncCookieGroups: [group([
        syncCookie("identity.example.test", "/admin", "session"),
        syncCookie(".example.test", "/", "session"),
        syncCookie("example.test", "/", "session"),
      ])],
    })], 1);

    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.syncCookieGroups?.[0]?.items.map(cookie => cookie.value);
    }).toEqual(["admin", "domain-cookie", ""]);
  });

  it("updates duplicate identities and follows overwrite, deletion, and expiration", async () => {
    const { extension } = state;
    await extension.context.addCookies([{
      domain: "changes.example.test",
      name: "session",
      path: "/",
      value: "first",
    }]);
    await extension.setProfiles([profile({
      syncCookieGroups: [group([
        syncCookie("changes.example.test", "/", "session"),
        syncCookie("changes.example.test", "/", "session"),
      ])],
    })], 1);
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.syncCookieGroups?.[0]?.items.map(cookie => cookie.value);
    }).toEqual(["first", "first"]);

    await extension.context.addCookies([{
      domain: "changes.example.test",
      name: "session",
      path: "/",
      value: "second",
    }]);
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.syncCookieGroups?.[0]?.items.map(cookie => cookie.value);
    }).toEqual(["second", "second"]);

    await extension.context.clearCookies({ domain: "changes.example.test", name: "session" });
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.syncCookieGroups?.[0]?.items.map(cookie => cookie.value);
    }).toEqual(["", ""]);
    await expect.poll(() => extension.ruleCount()).toBe(0);
  });

  it("resynchronizes when the configured identity changes", async () => {
    const { extension } = state;
    await extension.context.addCookies([{
      domain: "identity-change.example.test",
      name: "session",
      path: "/correct",
      value: "found-after-change",
    }]);
    await extension.setProfiles([profile({
      syncCookieGroups: [group([syncCookie("identity-change.example.test", "/wrong", "session")])],
    })], 0);

    const manager = await extension.manager();
    manager.profiles[0]!.syncCookieGroups![0]!.items[0]!.path = "/correct";
    await extension.updateManager(manager);
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.syncCookieGroups?.[0]?.items[0]?.value;
    }).toBe("found-after-change");
    await expect.poll(() => extension.ruleCount()).toBe(1);
  });

  it("does not generate modifications for disabled, incomplete, missing, or empty cookies", async () => {
    const { extension } = state;
    const disabled = { ...syncCookie("disabled.example.test", "/", "session", "secret"), enabled: false };
    await extension.setProfiles([profile({
      syncCookieGroups: [group([
        disabled,
        syncCookie("", "/", "session", "secret"),
        syncCookie("missing.example.test", "", "session", "secret"),
        syncCookie("missing.example.test", "/", "", "secret"),
        syncCookie("missing.example.test", "/", "session"),
      ])],
    })], 0);

    expect(await extension.rules()).toEqual([]);
  });
});
