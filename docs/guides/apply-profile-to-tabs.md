# Apply a profile to tabs or tab groups

Use tab conditions when a profile should affect selected browser tabs instead of every matching tab.

## Current tab

1. Open the target tab.
2. Add **Tab IDs** to the profile.
3. Select or add the current tab.
4. Verify the rule in that tab and in a second tab.

Use **Excluded tab IDs** to apply a rule everywhere except selected tabs.

## Tab group

1. Put the target tabs in a Chrome tab group.
2. Add **Tab groups** to the profile.
3. Grant the optional Tab Groups permission.
4. Select the group.
5. Add or remove a tab from the browser group and verify that Headerly updates the rule.

::: warning Browser restart clears selections
Selections saved under **Tab IDs** and **Tab groups** are cleared when the browser restarts. Chrome only guarantees tab and tab-group IDs within the current browser session, so this is a browser limitation, not a Headerly limitation.

Headerly automatically pauses any profile that had an active tab or tab-group condition before the restart. This prevents the profile from unexpectedly applying to more tabs after its saved selection is cleared. Select the tabs or groups again before resuming the profile.
:::

See [Tab IDs](/reference/conditions/tab-ids) and [Tab groups](/reference/conditions/tab-groups).
