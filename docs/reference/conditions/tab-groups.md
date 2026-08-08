# Tab groups

Tab-group conditions bind a profile to the current tabs in selected Chrome tab groups.

## `tabGroups`

The rule includes tabs in the selected groups.

## `excludedTabGroups`

The rule excludes tabs in the selected groups.

Headerly stores each selected group ID with a snapshot of its Tab IDs, then translates the snapshot into DNR `tabIds` or `excludedTabIds`. It refreshes bindings when tabs are created, closed, or moved between groups.

## Lifetime

Chrome group IDs are unique only within a browser session. Headerly clears old bindings at browser startup. If a group is removed or every bound tab disappears, the empty temporary condition disables an enabled profile.

Tab-group profiles use session-scoped DNR rules and tab-group conditions are omitted from exports.

## Permission

Selecting a group requires the optional `tabGroups` permission. Headerly uses `chrome.tabGroups` for group metadata and lifecycle events, and `chrome.tabs.query()` to find group members.

See the [Chrome Tab Groups API](https://developer.chrome.com/docs/extensions/reference/api/tabGroups).
