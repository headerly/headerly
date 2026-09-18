import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { useProfileId2ErrorMessageRecordStorage } from "../storage";

describe("extension storage synchronization", () => {
  let scope = effectScope();

  beforeEach(async () => {
    vi.useFakeTimers();
    scope = effectScope();
    await storage.setItem("local:profileId2ErrorMessageRecord", {});
  });

  afterEach(() => {
    scope.stop();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function errorStorage() {
    const ready = Promise.withResolvers<Record<string, string>>();
    const result = scope.run(() => {
      const wrapper = useProfileId2ErrorMessageRecordStorage({ onReady: ready.resolve });
      return { item: wrapper.item, ref: wrapper.ref };
    })!;
    await ready.promise;
    return result;
  }

  it("does not create reactive listeners or delayed writes for item-only callers", async () => {
    const addListener = vi.spyOn(browser.storage.local.onChanged, "addListener");
    const wrapper = useProfileId2ErrorMessageRecordStorage();
    const write = vi.spyOn(browser.storage.local, "set");

    await wrapper.item.setValue({ profile: "new error" });
    await vi.advanceTimersByTimeAsync(1000);

    expect(addListener).not.toHaveBeenCalled();
    expect(write).toHaveBeenCalledTimes(1);
    expect(await wrapper.item.getValue()).toEqual({ profile: "new error" });
  });

  it("reads initial state and synchronizes external changes without writing them back", async () => {
    await storage.setItem("local:profileId2ErrorMessageRecord", { profile: "initial error" });
    const write = vi.spyOn(browser.storage.local, "set");
    const { ref, item } = await errorStorage();
    expect(ref.value).toEqual({ profile: "initial error" });
    await vi.advanceTimersByTimeAsync(1000);
    expect(write).not.toHaveBeenCalled();

    await item.setValue({ profile: "external error" });
    await nextTick();
    expect(ref.value).toEqual({ profile: "external error" });
    await vi.advanceTimersByTimeAsync(1000);
    expect(write).toHaveBeenCalledTimes(1);
  });

  it("debounces nested UI edits and synchronizes another popup without echo writes", async () => {
    const first = await errorStorage();
    const second = await errorStorage();
    const write = vi.spyOn(browser.storage.local, "set");

    first.ref.value.profile = "first edit";
    await vi.advanceTimersByTimeAsync(100);
    first.ref.value.profile = "latest edit";
    await vi.advanceTimersByTimeAsync(199);
    expect(write).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await first.item.getValue()).toEqual({ profile: "latest edit" });
    expect(second.ref.value).toEqual({ profile: "latest edit" });
    await vi.advanceTimersByTimeAsync(1000);
    expect(write).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending local snapshot when a newer external value arrives", async () => {
    const { ref, item } = await errorStorage();
    const write = vi.spyOn(browser.storage.local, "set");
    ref.value.profile = "pending local edit";
    await vi.advanceTimersByTimeAsync(199);

    await item.setValue({ profile: "newer external edit" });
    await vi.advanceTimersByTimeAsync(1000);

    expect(ref.value).toEqual({ profile: "newer external edit" });
    expect(await item.getValue()).toEqual({ profile: "newer external edit" });
    expect(write).toHaveBeenCalledTimes(1);
  });

  it("stops synchronization and cancels pending writes when its scope is disposed", async () => {
    const { ref, item } = await errorStorage();
    ref.value.profile = "unsaved edit";
    await nextTick();
    scope.stop();
    const write = vi.spyOn(browser.storage.local, "set");
    await vi.advanceTimersByTimeAsync(1000);
    expect(write).not.toHaveBeenCalled();

    await item.setValue({ profile: "external edit" });
    expect(ref.value).toEqual({ profile: "unsaved edit" });
  });
});
