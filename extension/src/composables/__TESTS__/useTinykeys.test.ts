import { describe, expect, it, vi } from "vitest";
import { useTinykeys } from "../useTinykeys";

const { onUnmounted, stop } = vi.hoisted(() => ({
  onUnmounted: vi.fn(),
  stop: vi.fn(),
}));

vi.mock("tinykeys", () => ({
  parseKeybinding: () => [[["Control"], [], "n"]],
  tinykeys: () => stop,
}));

vi.mock("vue", () => ({
  onUnmounted,
}));

describe("useTinykeys", () => {
  it("removes its listener when the component is unmounted", () => {
    useTinykeys({} as Window, "$mod+n", vi.fn());

    expect(onUnmounted).toHaveBeenCalledOnce();
    expect(onUnmounted).toHaveBeenCalledWith(stop);
  });
});
