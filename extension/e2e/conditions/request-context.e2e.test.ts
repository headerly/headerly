import { describe, expect, it } from "vitest";
import {
  fetchEcho,
  group,
  header,
  item,
  loadInspectionScript,
  profile,
} from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

function markerProfile(filters: ReturnType<typeof profile>["filters"]) {
  return profile({
    filters,
    requestHeaderModGroups: [group([
      header("x-context", "set", "matched"),
      header("x-resource-type", "set", "matched"),
    ])],
  });
}

describe("documented request-context conditions", { concurrent: false }, () => {
  const state = setupExtensionSuite();

  it("matches the initiating origin independently from the destination", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      initiatorDomains: group([item("127.0.0.1")]),
      requestDomains: group([item("localhost")]),
    })], 1);

    expect((await fetchEcho(page, `${server.localhostOrigin}/echo`)).headers["x-context"])
      .toBe("matched");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-context"])
      .toBeUndefined();
    await page.close();
  });

  it("gives excluded initiator domains precedence", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      excludedInitiatorDomains: group([item("127.0.0.1")]),
    })], 1);

    expect((await fetchEcho(page, `${server.localhostOrigin}/echo`)).headers["x-context"])
      .toBeUndefined();
    await page.close();
  });

  it("distinguishes top-level domain from a nested frame initiator", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await page.evaluate((frameUrl) => {
      const iframe = document.createElement("iframe");
      iframe.src = frameUrl;
      document.body.append(iframe);
    }, `${server.localhostOrigin}/frame`);
    const frame = page.frames().find(candidate => candidate.url() === `${server.localhostOrigin}/frame`)
      ?? await page.waitForEvent("framenavigated", { predicate: candidate => candidate.url() === `${server.localhostOrigin}/frame` });

    await extension.setProfiles([markerProfile({
      initiatorDomains: group([item("localhost")]),
      requestDomains: group([item("127.0.0.1")]),
      topDomains: group([item("127.0.0.1")]),
    })], 1);
    expect((await fetchEcho(frame, `${server.loopbackOrigin}/echo`)).headers["x-context"])
      .toBe("matched");

    await extension.setProfiles([markerProfile({
      excludedTopDomains: group([item("127.0.0.1")]),
      initiatorDomains: group([item("localhost")]),
      requestDomains: group([item("127.0.0.1")]),
    })], 1);
    expect((await fetchEcho(frame, `${server.loopbackOrigin}/echo`)).headers["x-context"])
      .toBeUndefined();
    await page.close();
  });

  it("distinguishes first-party and third-party requests", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      domainType: { enabled: true, value: "firstParty" },
    })], 1);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-context"])
      .toBe("matched");
    expect((await fetchEcho(page, `${server.localhostOrigin}/echo`)).headers["x-context"])
      .toBeUndefined();

    await extension.setProfiles([markerProfile({
      domainType: { enabled: true, value: "thirdParty" },
    })], 1);
    expect((await fetchEcho(page, `${server.localhostOrigin}/echo`)).headers["x-context"])
      .toBe("matched");
    await page.close();
  });

  it("includes and excludes HTTP request methods with normalized deduplicated values", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      requestMethods: group([item(["post", "post"])]),
    })], 1);
    expect((await extension.rules())[0]?.condition.requestMethods).toEqual(["post"]);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`, { body: "data", method: "POST" })).headers["x-context"])
      .toBe("matched");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-context"])
      .toBeUndefined();

    await extension.setProfiles([markerProfile({
      excludedRequestMethods: group([item(["post"])]),
    })], 1);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`, { body: "data", method: "POST" })).headers["x-context"])
      .toBeUndefined();
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-context"])
      .toBe("matched");
    await page.close();
  });

  it("matches every resource type by default except for allowAllRequests", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({})], 1);

    const resourceTypes = (await extension.rules())[0]?.condition.resourceTypes as string[];
    expect(resourceTypes).toContain("main_frame");
    expect(resourceTypes).toContain("script");
    expect(resourceTypes).toContain("xmlhttprequest");
    expect(resourceTypes).toHaveLength(15);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-resource-type"])
      .toBe("matched");
    expect(await loadInspectionScript(page, `${server.loopbackOrigin}/inspect-script.js`)).toBe("matched");
    await page.close();
  });

  it("narrows resource types with include and exclude conditions", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      resourceTypes: group([item(["script", "script"])]),
    })], 1);
    expect((await extension.rules())[0]?.condition.resourceTypes).toEqual(["script"]);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-resource-type"])
      .toBeUndefined();
    expect(await loadInspectionScript(page, `${server.loopbackOrigin}/inspect-script.js`)).toBe("matched");

    await extension.setProfiles([markerProfile({
      excludedResourceTypes: group([item(["xmlhttprequest"])]),
    })], 1);
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-resource-type"])
      .toBeUndefined();
    expect(await loadInspectionScript(page, `${server.loopbackOrigin}/inspect-script.js`)).toBe("matched");
    await page.close();
  });

  it("combines different condition types with logical AND", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page`);
    await extension.setProfiles([markerProfile({
      requestDomains: group([item("127.0.0.1")]),
      requestMethods: group([item(["post"])]),
      resourceTypes: group([item(["xmlhttprequest"])]),
    })], 1);

    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`, { body: "data", method: "POST" })).headers["x-context"])
      .toBe("matched");
    expect((await fetchEcho(page, `${server.loopbackOrigin}/echo`)).headers["x-context"])
      .toBeUndefined();
    expect((await fetchEcho(page, `${server.localhostOrigin}/echo`, { body: "data", method: "POST" })).headers["x-context"])
      .toBeUndefined();
    await page.close();
  });
});
