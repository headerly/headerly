# Tab IDs

Tab ID conditions bind a profile to browser tabs.

## `tabIds`

The rule matches only requests associated with the selected tabs.

## `excludedTabIds`

The rule excludes requests associated with the selected tabs.

## Lifetime

Closing a selected tab removes it from the condition. If no selected tabs remain, Headerly disables the profile.

::: warning Browser restart clears selections
Selections saved under **Tab IDs** and **Tab groups** are cleared when the browser restarts. Chrome only guarantees these IDs within the current browser session, so this is a browser limitation, not a Headerly limitation.

Headerly automatically pauses any profile that had an active tab or tab-group condition before the restart. This prevents the profile from unexpectedly applying to more tabs after its saved selection is cleared.
:::

Use [Tab groups](/reference/conditions/tab-groups) when membership should follow a browser tab group.
