import { describe, expect, it } from "vitest";
import { getDefaultFilterValueByHost } from "../utils";

describe("getDefaultFilterValueByHost", () => {
  it("preserves the port in URL filters", () => {
    expect(getDefaultFilterValueByHost("urlFilter", "localhost:3000"))
      .toBe("||localhost:3000/*");
  });

  it("preserves and escapes the port in regex filters", () => {
    expect(getDefaultFilterValueByHost("regexFilter", "localhost:3000"))
      .toBe(String.raw`^https?:\/\/localhost\:3000\/.*`);
  });
});
