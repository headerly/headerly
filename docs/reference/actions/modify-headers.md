# Modify headers

`modifyHeaders` changes request headers before they are sent or response headers after they are received.

## Header modification fields

| Field | Required | Behavior |
| --- | --- | --- |
| Name | Yes | Trimmed header name. Empty names are ignored. |
| Operation | Yes | `set`, `append`, or `remove` |
| Value | For `set` and `append` | Trimmed value. An empty value makes the item inactive. |

Disabled items remain in the profile but do not generate DNR modifications.

## Operations

### `set`

Creates the header or replaces its value. Lower-priority modifications may be restricted after a `set` operation.

### `append`

Adds another value. Chrome chooses the appropriate separator where possible.

### `remove`

Removes the header. It does not use a value. Lower-priority rules cannot modify that header afterward.

## Request and response timing

Request-header modifications run before Chrome sends headers to the server. Response-header modifications run after response headers arrive. A response modification cannot undo data already sent in the request.

Chrome DevTools may not display DNR response-header changes in the Network panel because of [Chromium issue 40196848](https://issues.chromium.org/issues/40196848). This is a display limitation, not evidence that the modification failed. See [Verify a modified response header](/guides/modify-response-headers#verify-the-modified-header).

## Append restrictions

Chrome only permits `append` for these request headers, using the exact lowercase spelling shown:

`accept`, `accept-encoding`, `accept-language`, `access-control-request-headers`, `cache-control`, `connection`, `content-language`, `cookie`, `forwarded`, `if-match`, `if-none-match`, `keep-alive`, `range`, `te`, `trailer`, `transfer-encoding`, `upgrade`, `user-agent`, `via`, `want-digest`, `x-forwarded-for`.

This allowlist is browser-defined and case-sensitive. See Chromium's [`kDNRRequestHeaderAppendAllowList`](https://chromium.googlesource.com/chromium/src/+/HEAD/extensions/browser/api/declarative_net_request/constants.h#314) for the current list and the delimiter used by each header. Response-header append is not limited by this request-header list.

## Conflicts

Matching `modifyHeaders` profiles are evaluated from higher to lower priority. An earlier operation limits later operations on the same header:

- after `append`, later rules may only append;
- after `set`, only lower-priority rules from the same extension may append;
- after `remove`, no later rule may modify the header.

Matching `allow` or `allowAllRequests` rules can suppress lower-priority header modifications. See [Priority and conflicts](/explanation/priority-and-conflicts).

## Source

See Chrome's [Declarative Net Request header modification](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#header-modification).
