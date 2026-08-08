# Priorities

Priority is a positive integer used by Chrome to resolve matching DNR rules.

| Property | Value |
| --- | --- |
| Minimum | 1 |
| Maximum | 2,147,483,647 |
| Default | 1 |

Higher values are evaluated before lower values. Do not rely on ordering between rules that have the same action and priority; browser vendors do not standardize that order.

Within Headerly, equal-priority actions are ordered by Chrome as follows:

1. `allow` and `allowAllRequests`
2. `block`
3. `upgradeScheme`
4. `redirect`

Matching header modifications are processed separately, from higher to lower priority, after allow rules are considered. See [Priority and conflicts](/explanation/priority-and-conflicts).

Set an explicit priority when profiles overlap or modify the same header. A narrow exception commonly uses a higher priority than a broad default profile.
