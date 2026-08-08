# Matching and rule scope

Conditions describe one request from several perspectives: its URL and destination, the origin that initiated it, the top-level page around it, its method and resource type, and the tab where it occurs.

Different condition types narrow one another. For example, a profile can require a destination domain, a `GET` method, and an `xmlhttprequest` resource type. Exclusions remove matches from their corresponding include set.

## Dynamic scope

Profiles without Tab ID or Tab Group bindings become dynamic DNR rules. Chrome persists dynamic rules across browser sessions and extension updates. Headerly also keeps the source profile in extension storage.

## Session scope

Tab IDs only have meaning in a live browser session. Therefore profiles using `tabIds`, `excludedTabIds`, `tabGroups`, or `excludedTabGroups` become session rules. Chrome clears session rules when the browser shuts down.

Headerly resolves Tab Groups into current Tab IDs and keeps that snapshot synchronized as group membership changes. It clears stale group bindings at startup and omits all temporary tab conditions from exports.

This scope distinction prevents a tab-bound profile from silently applying to unrelated tabs after browser IDs are reused.
