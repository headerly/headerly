import { describe, expect, it } from "vitest";
import {
  fetchEcho,
  fetchResponseHeaders,
  group,
  header,
  item,
  profile,
} from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

describe("documented modifyHeaders behavior", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("sets, appends, and removes request headers", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([profile({
      filters: { requestDomains: group([item("127.0.0.1")]) },
      requestHeaderModGroups: [group([
        header("x-guide-set", "set", "applied"),
        header("accept-language", "append", "fr"),
        header("x-guide-remove", "remove"),
      ])],
    })], 1);

    const result = await fetchEcho(page, `${server.loopbackOrigin}/echo`, {
      headers: {
        "accept-language": "en",
        "x-guide-remove": "present",
        "x-guide-set": "original",
      },
    });
    expect(result.headers["x-guide-set"]).toBe("applied");
    expect(result.headers["accept-language"]).toContain("en");
    expect(result.headers["accept-language"]).toContain("fr");
    expect(result.headers["x-guide-remove"]).toBeUndefined();
    await page.close();
  });

  it("trims valid fields and ignores disabled or incomplete items", async () => {
    const { extension } = state;
    const disabled = { ...header("x-disabled", "set", "ignored"), enabled: false };
    await extension.setProfiles([profile({
      requestHeaderModGroups: [group([
        header("  x-trimmed  ", "set", "  value  "),
        header("", "set", "missing-name"),
        header("x-empty", "set", "   "),
        disabled,
      ])],
    })], 1);

    const [rule] = await extension.rules();
    expect(rule?.action.requestHeaders).toEqual([{
      header: "x-trimmed",
      operation: "set",
      value: "value",
    }]);
  });

  it("reports Chrome registration errors for disallowed request-header append", async () => {
    const { extension } = state;
    const invalid = profile({
      requestHeaderModGroups: [group([header("x-not-allowlisted", "append", "value")])],
    });
    await extension.setProfiles([invalid], 0);

    await expect.poll(async () => (await extension.errors())[invalid.id]).toMatch(/append|header/i);
    expect((await extension.registrations())[invalid.id]).toBeUndefined();
  });

  it("sets, appends, and removes response headers as observed by fetch", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([profile({
      filters: { requestDomains: group([item("127.0.0.1")]) },
      responseHeaderModGroups: [group([
        header("x-guide-response", "set", "modified"),
        header("x-response-append", "append", "appended"),
        header("x-remove-response", "remove"),
      ])],
    })], 1);

    const responseHeaders = await fetchResponseHeaders(page, `${server.loopbackOrigin}/response`);
    expect(responseHeaders["x-guide-response"]).toBe("modified");
    expect(responseHeaders["x-response-append"]).toContain("original");
    expect(responseHeaders["x-response-append"]).toContain("appended");
    expect(responseHeaders["x-remove-response"]).toBeUndefined();
    await page.close();
  });

  it("uses priority to override a broad path with a narrower path", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([
      profile({
        filters: { urlFilter: [item(`${server.loopbackOrigin}/path/a/`)] },
        priority: 1,
        requestHeaderModGroups: [group([header("x-priority", "set", "a")])],
      }),
      profile({
        filters: { urlFilter: [item(`${server.loopbackOrigin}/path/a/b/`)] },
        priority: 2,
        requestHeaderModGroups: [group([header("x-priority", "set", "b")])],
      }),
    ], 2);

    expect((await fetchEcho(page, `${server.loopbackOrigin}/path/a/file`)).headers["x-priority"])
      .toBe("a");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/path/a/b/file`)).headers["x-priority"])
      .toBe("b");
    await page.close();
  });

  it("prevents lower-priority changes after set/remove and allows append chains", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([
      profile({
        priority: 3,
        requestHeaderModGroups: [group([
          header("x-conflict", "set", "highest"),
          header("cookie", "remove"),
          header("accept-language", "append", "high"),
        ])],
      }),
      profile({
        priority: 2,
        requestHeaderModGroups: [group([
          header("x-conflict", "set", "lower"),
          header("cookie", "append", "lower=value"),
          header("accept-language", "append", "low"),
        ])],
      }),
    ], 2);

    const result = await fetchEcho(page, `${server.loopbackOrigin}/echo`, {
      headers: { "accept-language": "base", "cookie": "original=value" },
    });
    expect(result.headers["x-conflict"]).toBe("highest");
    expect(result.headers.cookie).toBeUndefined();
    expect(result.headers["accept-language"]).toContain("high");
    expect(result.headers["accept-language"]).toContain("low");
    await page.close();
  });

  it("lets a higher-priority allow suppress header modification", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([
      profile({ priority: 2, ruleActionType: "allow" }),
      profile({
        priority: 1,
        requestHeaderModGroups: [group([header("x-suppressed", "set", "value")])],
      }),
    ], 2);

    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-suppressed"])
      .toBeUndefined();
    await page.close();
  });
});
