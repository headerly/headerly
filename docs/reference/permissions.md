# Permissions

## Required permissions

| Permission | Purpose |
| --- | --- |
| `storage` | Stores profiles, settings, registration records, and errors |
| `declarativeNetRequest` | Registers browser network rules |
| Host access to `<all_urls>` | Allows rules and cookie lookup across configured sites |

## Optional permissions

### `cookies`

Requested when cookie synchronization is added or imported. It allows Headerly to list selected-domain cookies, read their values, and receive change notifications. Headerly does not create or delete browser cookies through this feature.

### `tabGroups`

Requested when a Tab Groups condition is added. It allows Headerly to list groups and observe group removal. Headerly uses the Tabs API to resolve the tabs contained in each group.

Declining an optional permission cancels the operation that requires it. Existing unrelated profiles continue to work.

See [Chrome Cookies API](https://developer.chrome.com/docs/extensions/reference/api/cookies) and [Chrome Tab Groups API](https://developer.chrome.com/docs/extensions/reference/api/tabGroups).
