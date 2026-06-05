import type { ProfileCoreData } from "../..";
import { describe, expect, it } from "vitest";
import { buildAction } from "../buildAction";

function createRedirectProfile(overrides?: Partial<ProfileCoreData>): ProfileCoreData {
  return {
    id: "profile-1",
    enabled: true,
    ruleActionType: "redirect",
    priority: 1,
    requestHeaderModGroups: [],
    responseHeaderModGroups: [],
    syncCookieGroups: [],
    redirectUrlGroup: [],
    redirectRegexSubstitution: [],
    redirectTransform: undefined,
    filters: {},
    ...(overrides ?? {}),
  };
}

describe("buildAction redirect", () => {
  it("builds redirect url, regex substitution and transform values", () => {
    const profile = createRedirectProfile({
      redirectUrlGroup: [{ id: "1", enabled: true, value: "  https://example.com/next  " }],
      redirectRegexSubstitution: [{ id: "2", enabled: true, value: "  https://cdn.example.com/\\1  " }],
      redirectTransform: {
        host: [{ id: "3", enabled: true, value: "  assets.example.com  " }],
        queryTransform: {
          removeParams: {
            type: "checkbox",
            items: [{ id: "4", enabled: true, value: "  utm_source  " }],
          },
          addOrReplaceParams: {
            type: "checkbox",
            items: [{ id: "5", enabled: true, key: "  lang  ", value: "  en  ", replaceOnly: true }],
          },
        },
      },
    });

    const action = buildAction(profile);
    if (action.type !== "redirect") {
      throw new Error("Expected redirect action");
    }

    expect(action.redirect.url).toBe("https://example.com/next");
    expect(action.redirect.regexSubstitution).toBe("https://cdn.example.com/\\1");
    expect(action.redirect.transform).toEqual({
      host: "assets.example.com",
      queryTransform: {
        removeParams: ["utm_source"],
        addOrReplaceParams: [{ key: "lang", value: "en", replaceOnly: true }],
      },
    });
  });

  it("omits empty redirect values", () => {
    const profile = createRedirectProfile({
      redirectUrlGroup: [{ id: "1", enabled: true, value: "   " }],
      redirectRegexSubstitution: [{ id: "2", enabled: true, value: "" }],
      redirectTransform: {
        host: [{ id: "3", enabled: true, value: "   " }],
        queryTransform: {
          removeParams: {
            type: "checkbox",
            items: [{ id: "4", enabled: true, value: "  " }],
          },
          addOrReplaceParams: {
            type: "checkbox",
            items: [{ id: "5", enabled: true, key: "lang", value: "  " }],
          },
        },
      },
    });

    const action = buildAction(profile);
    if (action.type !== "redirect") {
      throw new Error("Expected redirect action");
    }

    expect(action.redirect.url).toBeUndefined();
    expect(action.redirect.regexSubstitution).toBeUndefined();
    expect(action.redirect.transform).toBeUndefined();
  });
});
