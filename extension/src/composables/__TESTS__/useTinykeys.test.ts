import { describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useTinykeys } from "../useTinykeys";

const { stop } = vi.hoisted(() => ({
  stop: vi.fn(),
}));

vi.mock("tinykeys", () => ({
  parseKeybinding: () => [[["Control"], [], "n"]],
  tinykeys: () => stop,
}));

describe("useTinykeys", () => {
  it("removes its listener when the active effect scope is disposed", () => {
    const scope = effectScope();

    scope.run(() => useTinykeys({} as Window, "$mod+n", vi.fn()));
    expect(stop).not.toHaveBeenCalled();

    scope.stop();
    expect(stop).toHaveBeenCalledOnce();
  });
});
