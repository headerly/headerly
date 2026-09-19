import { describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { addNameToRecentHeaderNames, useRecentHeaderNames } from "../useRecentHeaderNames";

vi.mock("@vueuse/core", async () => {
  const { ref } = await import("vue");
  return { useLocalStorage: (_key: string, initial: string[]) => ref(initial) };
});
vi.mock("@/entrypoints/popup/stores/useSettingsStore", () => ({
  useSettingsStore: vi.fn(),
}));

describe("recent header names", () => {
  it("retains at most 20 names, preserving normalization and duplicate handling", () => {
    let names: string[] = [];
    for (let index = 0; index < 21; index++)
      names = addNameToRecentHeaderNames(names, ` X-Header-${index} `);
    expect(names).toHaveLength(20);
    expect(names[0]).toBe("x-header-20");
    expect(names.at(-1)).toBe("x-header-1");
    expect(addNameToRecentHeaderNames(names, "X-HEADER-10")).toBe(names);
    expect(addNameToRecentHeaderNames(names, "  ")).toBe(names);
  });

  it("updates both lists immediately without losing hidden history and bounds invalid settings", () => {
    const settings = reactive({ recentlyAddedCount: 3 });
    vi.mocked(useSettingsStore).mockReturnValue(settings as ReturnType<typeof useSettingsStore>);
    const request = useRecentHeaderNames("request");
    const response = useRecentHeaderNames("response");
    for (let index = 0; index < 20; index++) {
      request.addRecentHeaderName(`x-request-${index}`);
      response.addRecentHeaderName(`x-response-${index}`);
    }
    expect(request.recentHeaderNames.value).toHaveLength(3);
    expect(response.recentHeaderNames.value).toHaveLength(3);
    settings.recentlyAddedCount = 1;
    expect(request.recentHeaderNames.value).toEqual(["x-request-19"]);
    expect(response.recentHeaderNames.value).toEqual(["x-response-19"]);
    settings.recentlyAddedCount = 20;
    expect(request.recentHeaderNames.value).toHaveLength(20);
    expect(response.recentHeaderNames.value).toHaveLength(20);
    request.removeRecentHeaderName("X-REQUEST-19");
    expect(request.recentHeaderNames.value[0]).toBe("x-request-18");
    expect(response.recentHeaderNames.value).toHaveLength(20);
    settings.recentlyAddedCount = 100;
    expect(response.recentHeaderNames.value).toHaveLength(20);
    settings.recentlyAddedCount = 0;
    expect(response.recentHeaderNames.value).toHaveLength(1);
    settings.recentlyAddedCount = Number.NaN;
    expect(response.recentHeaderNames.value).toHaveLength(3);
  });
});
