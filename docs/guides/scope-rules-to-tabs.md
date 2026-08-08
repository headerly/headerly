# Scope rules to tabs or tab groups

Use temporary tab conditions when a rule should affect an active debugging session instead of every matching browser tab.

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

Tab and tab-group conditions create session-scoped DNR rules. They are not exported, and their bindings do not survive a browser restart. See [Tab IDs](/reference/conditions/tab-ids) and [Tab groups](/reference/conditions/tab-groups).
