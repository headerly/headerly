# How conditions combine

Conditions describe one request from several perspectives: its URL and destination, the origin that initiated it, the top-level page around it, its method and resource type, and the tab where it occurs.

Different condition types narrow one another. For example, a profile can require a destination domain, a `GET` method, and an `xmlhttprequest` resource type. Exclusions remove matches from their corresponding include set.

## Included and excluded values

Included values narrow the requests that can match. Excluded values remove requests from that result. When a profile has several condition types, a request must satisfy all of them.

## Tabs and tab groups

Tab and Tab Group conditions apply the same profile to selected tabs or exclude those tabs from otherwise matching requests.

Selections saved under **Tab IDs** and **Tab groups** are cleared when the browser restarts. Chrome only guarantees these IDs within the current browser session, so this is a browser limitation, not a Headerly limitation.

Headerly automatically pauses any profile that had an active tab or tab-group condition before the restart. This prevents the profile from unexpectedly applying to more tabs after its saved selection is cleared.
