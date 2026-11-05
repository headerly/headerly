import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useJsonValidation } from "../useJsonValidation";

const profile = { name: "Test", emoji: "", enabled: true, ruleActionType: "block", filters: {} };

describe("jSON import diagnostics", () => {
  it("returns every field error and clears them when the input is fixed", () => {
    const json = ref(JSON.stringify({ version: 2, items: [{ kind: "profile", profile: { ...profile, name: 1, emoji: false } }] }));
    const validation = useJsonValidation(json);
    expect(validation.validJson.value).toBe(true);
    expect(validation.validJsonSchema.value).toBe(false);
    expect(validation.validationErrors.value.map(error => error.path)).toEqual(["$.items[0].profile.name", "$.items[0].profile.emoji"]);
    json.value = JSON.stringify({ version: 2, items: [{ kind: "profile", profile }] });
    expect(validation.validJsonSchema.value).toBe(true);
    expect(validation.validationErrors.value).toEqual([]);
  });

  it("reports all custom radio-group errors and accepts zero enabled members", () => {
    const group = { kind: "group", name: "Radio", color: "#000", type: "radio", profiles: [profile, profile] };
    const json = ref(JSON.stringify({ version: 2, items: [group, group] }));
    const validation = useJsonValidation(json);
    expect(validation.validationErrors.value).toEqual([0, 1].map(index => ({
      path: `$.items[${index}].profiles`,
      message: "A radio group can have at most one enabled profile",
    })));
    json.value = JSON.stringify({ version: 2, items: [{ ...group, profiles: [{ ...profile, enabled: false }] }] });
    expect(validation.validJsonSchema.value).toBe(true);
  });

  it("reports malformed JSON and unsupported versions", () => {
    const json = ref("{");
    const validation = useJsonValidation(json);
    expect(validation.validJson.value).toBe(false);
    expect(validation.validationErrors.value[0]?.path).toBe("$");
    expect(validation.validationErrors.value[0]?.message).toBeTruthy();
    json.value = JSON.stringify({ version: 999, items: [] });
    expect(validation.validJson.value).toBe(true);
    expect(validation.validJsonSchema.value).toBe(false);
    expect(validation.validationErrors.value[0]?.path).toBe("$.version");
  });

  it("exposes nested union failures instead of only a generic invalid-input error", () => {
    const json = ref(JSON.stringify({ version: 1, profiles: [{ ...profile, requestHeaderModGroups: [{ type: "checkbox", items: [{ enabled: true, name: 1, operation: "set", value: false }] }] }] }));
    const validation = useJsonValidation(json);
    expect(validation.validationErrors.value.some(error => error.path === "$.profiles[0].requestHeaderModGroups[0].items[0].name")).toBe(true);
    expect(validation.validationErrors.value.some(error => error.path === "$.profiles[0].requestHeaderModGroups[0].items[0].value")).toBe(true);
  });
});
