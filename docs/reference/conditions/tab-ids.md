# Tab IDs

Tab ID conditions bind a profile to browser tabs.

## `tabIds`

The rule matches only requests associated with the selected tabs.

## `excludedTabIds`

The rule excludes requests associated with the selected tabs.

Headerly uses non-negative Chrome Tab IDs. Closed tabs are removed from stored bindings. If every enabled item in a temporary tab condition becomes empty, Headerly disables the profile.

Rules containing either field are registered as session rules. Chrome clears session rules when the browser shuts down, and Headerly does not include Tab ID conditions in exported profiles.

Use [Tab groups](/reference/conditions/tab-groups) when membership should follow a browser tab group.
