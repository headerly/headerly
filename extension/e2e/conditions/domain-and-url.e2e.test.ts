import { describe, expect, it } from "vitest";
import { fetchEcho, group, header, item, profile } from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

function markerProfile(filters: ReturnType<typeof profile>["filters"]) {
  return profile({
    filters,
    requestHeaderModGroups: [group([header("x-condition", "set", "matched")])],
  });
}

describe("documented destination-domain and URL conditions", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("combines request-domain includes and exclusions with exclusion precedence", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      excludedRequestDomains: group([item("localhost")]),
      requestDomains: group([
        item("  127.0.0.1  "),
        item("127.0.0.1"),
        { ...item("disabled.test"), enabled: false },
      ]),
    })], 1);

    const [rule] = await extension.rules();
    expect(rule?.condition.requestDomains).toEqual(["127.0.0.1"]);
    expect(rule?.condition.excludedRequestDomains).toEqual(["localhost"]);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-condition"])
      .toBe("matched");
    expect((await fetchEcho(page, `${server.localhostOrigin}/echo`)).headers["x-condition"])
      .toBeUndefined();
    await page.close();
  });

  it("passes Chrome URL-filter tokens through and matches an exact URL", async () => {
    const { extension, server } = state;
    const exact = `${server.loopbackOrigin}/echo`;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({ urlFilter: [item(`  |${exact}|  `)] })], 1);

    expect((await extension.rules())[0]?.condition.urlFilter).toBe(`|${exact}|`);
    expect((await fetchEcho(page, exact)).headers["x-condition"]).toBe("matched");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo?extra=true`)).headers["x-condition"])
      .toBeUndefined();
    await page.close();
  });

  it("matches complete URLs with RE2 regex syntax", async () => {
    const { extension, server } = state;
    const escapedOrigin = server.loopbackOrigin.replaceAll(".", "\\.");
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      regexFilter: [item(`^${escapedOrigin}/path/regex/[0-9]+$`)],
    })], 1);

    expect((await fetchEcho(page, `${server.loopbackOrigin}/path/regex/123`)).headers["x-condition"])
      .toBe("matched");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/path/regex/text`)).headers["x-condition"])
      .toBeUndefined();
    await page.close();
  });

  it("gives an enabled regex filter precedence over an imported URL filter", async () => {
    const { extension, server } = state;
    const escapedOrigin = server.loopbackOrigin.replaceAll(".", "\\.");
    await extension.setProfiles([markerProfile({
      regexFilter: [item(`^${escapedOrigin}/path/regex-only$`)],
      urlFilter: [item(`${server.loopbackOrigin}/path/url-only`)],
    })], 1);

    const [rule] = await extension.rules();
    expect(rule?.condition.regexFilter).toContain("regex-only");
    expect(rule?.condition.urlFilter).toBeUndefined();
  });

  it("supports explicit URL case sensitivity and Chrome's default insensitive mode", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    const urlFilter = `${server.loopbackOrigin}/path/CaseSensitive`;
    await extension.setProfiles([markerProfile({
      isUrlFilterCaseSensitive: { enabled: true, value: true },
      urlFilter: [item(urlFilter)],
    })], 1);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/path/CaseSensitive`)).headers["x-condition"])
      .toBe("matched");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/path/casesensitive`)).headers["x-condition"])
      .toBeUndefined();

    await extension.setProfiles([markerProfile({
      isUrlFilterCaseSensitive: { enabled: true, value: false },
      urlFilter: [item(urlFilter)],
    })], 1);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/path/casesensitive`)).headers["x-condition"])
      .toBe("matched");
    await page.close();
  });

  it("uses only the first enabled URL/regex value because Chrome accepts one", async () => {
    const { extension } = state;
    await extension.setProfiles([markerProfile({
      regexFilter: [
        { ...item("ignored-disabled"), enabled: false },
        item("first-enabled"),
        item("second-enabled"),
      ],
      urlFilter: [
        { ...item("ignored-disabled"), enabled: false },
        item("first-enabled"),
        item("second-enabled"),
      ],
    })], 1);

    const [rule] = await extension.rules();
    expect(rule?.condition.regexFilter).toBe("first-enabled");
    expect(rule?.condition.urlFilter).toBeUndefined();
  });

  it("stores unsupported RE2 syntax as a profile registration error", async () => {
    const { extension } = state;
    const invalid = markerProfile({ regexFilter: [item("example(?=\\.com)")] });
    await extension.setProfiles([invalid], 0);

    await expect.poll(async () => (await extension.errors())[invalid.id]).toMatch(/regex|regular expression|syntax/i);
    expect((await extension.registrations())[invalid.id]).toBeUndefined();
  });

  it("treats empty and disabled condition items as absent and always excludes Headerly itself", async () => {
    const { extension } = state;
    await extension.setProfiles([markerProfile({
      requestDomains: group([
        item("   "),
        { ...item("disabled.test"), enabled: false },
      ]),
      urlFilter: [item("   ")],
    })], 1);

    const [rule] = await extension.rules();
    expect(rule?.condition.requestDomains).toBeUndefined();
    expect(rule?.condition.urlFilter).toBeUndefined();
    expect(rule?.condition.excludedInitiatorDomains).toContain(extension.extensionId);
  });
});
