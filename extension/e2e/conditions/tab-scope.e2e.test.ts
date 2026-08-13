import { describe, expect, it } from "vitest";
import { fetchEcho, group, header, item, profile } from "../extension-fixture";
import { setupExtensionSuite } from "../suite";

describe("documented tab and tab-group conditions", { concurrent: false }, () => {
  const state = setupExtensionSuite();
  const scopedHeaders = () => [group([header("x-tab-scope", "set", "matched")])];

  it("includes selected tab IDs and excludes selected tab IDs", async () => {
    const { extension, server } = state;
    await extension.setProfiles([], 0);
    const first = await extension.context.newPage();
    const second = await extension.context.newPage();
    await first.goto(`${server.loopbackOrigin}/page?tab=first`);
    await second.goto(`${server.loopbackOrigin}/page?tab=second`);
    const firstId = await extension.tabId(first);

    await extension.setProfiles([profile({
      filters: { tabIds: group([item([firstId])]) },
      requestHeaderModGroups: scopedHeaders(),
    })], 1);
    expect((await extension.registrations())[Object.keys(await extension.registrations())[0]!]?.ruleScope)
      .toBe("session");
    expect((await fetchEcho(first, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBe("matched");
    expect((await fetchEcho(second, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBeUndefined();

    await extension.setProfiles([profile({
      filters: { excludedTabIds: group([item([firstId])]) },
      requestHeaderModGroups: scopedHeaders(),
    })], 1);
    expect((await fetchEcho(first, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBeUndefined();
    expect((await fetchEcho(second, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBe("matched");
    await first.close();
    await second.close();
  });

  it("removes closed tab IDs and pauses a profile when its selection becomes empty", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page?tab=close-me`);
    const tabId = await extension.tabId(page);
    await extension.setProfiles([profile({
      filters: { tabIds: group([item([tabId])]) },
      requestHeaderModGroups: scopedHeaders(),
    })], 1);
    await page.close();

    await expect.poll(async () => (await extension.manager()).profiles[0]?.filters.tabIds?.items[0]?.value)
      .toEqual([]);
    expect((await extension.manager()).profiles[0]?.enabled).toBe(false);
    await expect.poll(() => extension.ruleCount()).toBe(0);
  });

  it("keeps an included tab-group condition synchronized with membership", async () => {
    const { extension, server } = state;
    const first = await extension.context.newPage();
    const second = await extension.context.newPage();
    await first.goto(`${server.loopbackOrigin}/page?group=first`);
    await second.goto(`${server.loopbackOrigin}/page?group=second`);
    const firstId = await extension.tabId(first);
    const secondId = await extension.tabId(second);
    const groupId = await extension.worker.evaluate(async (tabId) => {
      return await chrome.tabs.group({ tabIds: [tabId] });
    }, firstId);
    await extension.setProfiles([profile({
      filters: { tabGroups: group([item([{ groupId, tabIds: [firstId] }])]) },
      requestHeaderModGroups: scopedHeaders(),
    })], 1);

    await extension.worker.evaluate(async ({ groupId: targetGroupId, tabId }) => {
      await chrome.tabs.group({ groupId: targetGroupId, tabIds: [tabId] });
    }, { groupId, tabId: secondId });
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.filters.tabGroups?.items[0]?.value[0]?.tabIds.toSorted();
    }).toEqual([firstId, secondId].toSorted());
    expect((await fetchEcho(second, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBe("matched");

    await extension.worker.evaluate(async tabId => await chrome.tabs.ungroup(tabId), firstId);
    await expect.poll(async () => {
      return (await extension.manager()).profiles[0]?.filters.tabGroups?.items[0]?.value[0]?.tabIds;
    }).toEqual([secondId]);
    expect((await fetchEcho(first, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBeUndefined();
    await first.close();
    await second.close();
  });

  it("excludes every tab currently synchronized from a selected group", async () => {
    const { extension, server } = state;
    const grouped = await extension.context.newPage();
    const ungrouped = await extension.context.newPage();
    await grouped.goto(`${server.loopbackOrigin}/page?excluded-group=true`);
    await ungrouped.goto(`${server.loopbackOrigin}/page?excluded-group=false`);
    const groupedId = await extension.tabId(grouped);
    const groupId = await extension.worker.evaluate(async (tabId) => {
      return await chrome.tabs.group({ tabIds: [tabId] });
    }, groupedId);
    await extension.setProfiles([profile({
      filters: { excludedTabGroups: group([item([{ groupId, tabIds: [groupedId] }])]) },
      requestHeaderModGroups: scopedHeaders(),
    })], 1);

    expect((await fetchEcho(grouped, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBeUndefined();
    expect((await fetchEcho(ungrouped, `${server.loopbackOrigin}/echo`)).headers["x-tab-scope"])
      .toBe("matched");
    await grouped.close();
    await ungrouped.close();
  });

  it("removes a deleted group and pauses the now-unscoped profile", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page?remove-group=true`);
    const tabId = await extension.tabId(page);
    const groupId = await extension.worker.evaluate(async id => await chrome.tabs.group({ tabIds: [id] }), tabId);
    await extension.setProfiles([profile({
      filters: { tabGroups: group([item([{ groupId, tabIds: [tabId] }])]) },
      requestHeaderModGroups: scopedHeaders(),
    })], 1);
    await extension.worker.evaluate(async id => await chrome.tabs.ungroup(id), tabId);

    await expect.poll(async () => (await extension.manager()).profiles[0]?.filters.tabGroups?.items[0]?.value)
      .toEqual([]);
    expect((await extension.manager()).profiles[0]?.enabled).toBe(false);
    await page.close();
  });

  it("clears temporary selections and pauses affected profiles after browser restart", async () => {
    const { extension, server } = state;
    const page = await extension.context.newPage();
    await page.goto(`${server.loopbackOrigin}/page?restart=true`);
    const tabId = await extension.tabId(page);
    const groupId = await extension.worker.evaluate(async id => await chrome.tabs.group({ tabIds: [id] }), tabId);
    await extension.setProfiles([profile({
      filters: {
        tabGroups: group([item([{ groupId, tabIds: [tabId] }])]),
        tabIds: group([item([tabId])]),
      },
      requestHeaderModGroups: scopedHeaders(),
    })], 1);

    await extension.restart();
    await expect.poll(async () => (await extension.manager()).profiles[0]?.enabled).toBe(false);
    await expect.poll(async () => (await extension.manager()).profiles[0]?.filters.tabIds?.items[0]?.value)
      .toEqual([]);
    await expect.poll(async () => (await extension.manager()).profiles[0]?.filters.tabGroups?.items[0]?.value)
      .toEqual([]);
    const restarted = (await extension.manager()).profiles[0]!;
    expect(restarted.filters.tabIds?.items[0]?.value).toEqual([]);
    expect(restarted.filters.tabGroups?.items[0]?.value).toEqual([]);
    expect(await extension.ruleCount()).toBe(0);
  });
});
