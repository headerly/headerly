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

## Override a header for a nested path

To set a header to `a` for resources under `/path/a/`, but set the same header to `b` under `/path/a/b/`, create two overlapping Modify Headers profiles:

| Profile | Header operation | URL Filter | Priority |
| --- | --- | --- | --- |
| `/path/a/` | Set `X-Example-Header` to `a` | `*/path/a/*` | `1` |
| `/path/a/b/` | Set `X-Example-Header` to `b` | `*/path/a/b/*` | `2` |

A request under `/path/a/file.js` matches only the first profile and receives `X-Example-Header: a`. A request under `/path/a/b/file.js` matches both profiles. Headerly applies the higher-priority `set` operation first, setting `X-Example-Header: b`; the lower-priority `set` operation cannot overwrite it, so the final value is `b`.

The same pattern works with Regex Filter conditions. Headerly does not provide excluded URL Filter or excluded Regex Filter conditions, so overlapping profiles with different priorities are currently the only way to override a broad URL-pattern header value for a narrower URL pattern.

Set an explicit priority when profiles overlap or modify the same header.
