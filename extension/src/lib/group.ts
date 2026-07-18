import type { GroupItem, GroupType } from "./schema";

/**
 * Add a new item to a group list and set the correct enabled state.
 * - checkbox: the new item is enabled directly.
 * - radio: the new item becomes the only enabled item (others are disabled).
 */
export function addItemToGroup<T extends GroupItem>(list: T[], item: T, type: GroupType) {
  if (type === "radio") {
    list.forEach(existing => existing.enabled = false);
  }
  item.enabled = true;
  list.push(item);
}
