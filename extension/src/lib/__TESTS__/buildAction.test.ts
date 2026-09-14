import { describe, expect, it } from "vitest";
import { buildRequestHeaders } from "@/entrypoints/background/DNR/buildAction";
import { mockProfile } from "./schema.fixtures";

describe("buildRequestHeaders", () => {
  it("ignores synchronized cookies with an incomplete identity", () => {
    const profile = structuredClone(mockProfile);
    profile.requestHeaderModGroups = [];
    profile.syncCookieGroups![0]!.items[0]!.path = "";
    expect(buildRequestHeaders(profile)).toEqual([]);
  });
});
