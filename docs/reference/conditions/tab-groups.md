# Tab groups

Tab-group conditions are a synchronized form of [Tab ID conditions](/reference/conditions/tab-ids). Instead of selecting individual tabs, select a Chrome tab group. Headerly applies the profile to the tabs currently in that group and keeps the effective tab selection synchronized with the browser group.

## `tabGroups`

The rule includes tabs in the selected groups.

## `excludedTabGroups`

The rule excludes tabs in the selected groups.

When tabs are added to, removed from, or moved between selected groups, Headerly automatically updates which tabs the profile applies to.

## Lifetime

Removing a selected group removes it from the condition. If no selected tabs remain, Headerly disables the profile.

::: warning Browser restart clears selections
Selections saved under **Tab IDs** and **Tab groups** are cleared when the browser restarts. Chrome only guarantees these IDs within the current browser session, so this is a browser limitation, not a Headerly limitation.

Headerly automatically pauses any profile that had an active tab or tab-group condition before the restart. This prevents the profile from unexpectedly applying to more tabs after its saved selection is cleared.
:::

## Permission

Selecting a group requires the optional `tabGroups` permission.

See the [Chrome Tab Groups API](https://developer.chrome.com/docs/extensions/reference/api/tabGroups).
