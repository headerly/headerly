import type { GroupItem, ResourceType } from "../schema";
import { describe, expect, it } from "vitest";
import { buildCondition } from "@/entrypoints/background/DNR/buildCondition";
import { createProfile } from "../profileFactory";

type FilterValue = ResourceType | `${Browser.declarativeNetRequest.RequestMethod}` | number;

function createFilterItem<T extends FilterValue>(id: number, value: T[], enabled = true): GroupItem & { value: T[] } {
  return {
    id: `550e8400-e29b-41d4-a716-${id.toString().padStart(12, "0")}`,
    enabled,
    value,
  };
}

describe("buildCondition", () => {
  it("combines enabled checkbox items for grouped list conditions", () => {
    const profile = createProfile({
      filters: {
        resourceTypes: {
          type: "checkbox",
          items: [
            createFilterItem(1, ["script", "stylesheet"]),
            createFilterItem(2, ["script"]),
            createFilterItem(3, ["image"], false),
          ],
        },
        excludedResourceTypes: {
          type: "checkbox",
          items: [createFilterItem(4, ["font"])],
        },
        requestMethods: {
          type: "checkbox",
          items: [createFilterItem(5, ["get"]), createFilterItem(6, ["post"])],
        },
        excludedRequestMethods: {
          type: "checkbox",
          items: [createFilterItem(7, ["delete"])],
        },
        tabIds: {
          type: "checkbox",
          items: [createFilterItem(8, [42]), createFilterItem(9, [42, 43])],
        },
        excludedTabIds: {
          type: "checkbox",
          items: [createFilterItem(10, [44])],
        },
      },
    });

    const condition = buildCondition(profile, { nativeResourceTypeBehavior: false });

    expect(condition.resourceTypes).toEqual(["script", "stylesheet"]);
    expect(condition.excludedResourceTypes).toEqual(["font"]);
    expect(condition.requestMethods).toEqual(["get", "post"]);
    expect(condition.excludedRequestMethods).toEqual(["delete"]);
    expect(condition.tabIds).toEqual([42, 43]);
    expect(condition.excludedTabIds).toEqual([44]);
  });
});
