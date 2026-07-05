---
title: How to Use Sync Cookies
---

# How to Use the Sync Cookies Feature

Sync Cookies lets Headerly copy selected browser cookies into outgoing HTTP request headers. It is designed for cases where a website keeps authentication or session state in cookies and you want selected requests, such as local development API calls, to carry the same cookie values automatically.

::: warning Sensitive permission
This feature requires the optional `cookies` browser permission. Cookie access is highly sensitive because cookies can contain private data, session identifiers, and login credentials.

Only grant this permission if you understand why you need cookie synchronization. If you do not want Headerly to read and watch browser cookies, do not use this feature.
:::

## What It Does

When you select a source cookie, Headerly stores the cookie identity and keeps its value synchronized with the browser cookie jar. For every matching profile rule, Headerly appends the selected cookie to the outgoing request `Cookie` header.

For example, if the source website has:

```http
session_id=abc123
```

Headerly can append this cookie to matching requests as:

```http
Cookie: session_id=abc123
```

If the source cookie value later changes, Headerly updates the synchronized value. If the source cookie is deleted or expires, Headerly clears the synchronized value and stops appending that cookie until it exists again.

## When to Use It

Use Sync Cookies when you want a request to follow the current cookie value from another site or domain.

Common examples:

- You are developing a local frontend at `localhost` and need it to call an API using a login cookie from a staging or production website.
- Your application stores an access token, session ID, or tenant marker in a cookie, and you want selected development requests to reuse it.
- You need request headers to reflect cookie rotation automatically without manually editing profile values.

::: tip Use normal header modification for fixed values
If you want the target request to always send a stable cookie value, even after the source cookie changes, expires, or is deleted, do not use Sync Cookies.

Instead, add a request header modification with:

- `Name`: `Cookie`
- `Operation`: `append`
- `Value`: the fixed cookie string you want to send
:::

## Setup

1. Open a profile in Headerly.
2. Click the `+` button.
3. In the Actions tab, choose **Cookie Sync to Request Header**.
4. In the new Sync Cookies group, enter the source cookie domain in the domain input.
5. Choose the cookie you want to sync from the cookie selector.
6. Make sure the profile filters match the requests that should receive the cookie.

The domain input accepts either a plain domain or a URL. If you paste a URL, Headerly extracts the hostname.

::: details Example
If you enter:

```txt
https://app.example.com/dashboard
```

Headerly uses:

```txt
app.example.com
```
:::

## How Headerly Identifies a Cookie

When you choose a cookie from the selector, Headerly records these fields:

| Field | Purpose |
| --- | --- |
| `domain` | The cookie domain, such as `example.com` or `.example.com` |
| `path` | The cookie path, such as `/` or `/account` |
| `name` | The cookie name, such as `session_id` |
| `value` | The current value that will be appended to matching requests |

Headerly uses `domain + path + name` as the cookie identity. When the browser reports that a matching cookie changed, Headerly updates the stored value in your profile.

## Domain Matching

Cookie domains can be subtle. You may see both of these in the selector:

```txt
example.com
.example.com
```

They are not the same cookie domain.

| Domain | Meaning |
| --- | --- |
| `example.com` | A host-only cookie for exactly `example.com` |
| `.example.com` | A broader domain cookie that can apply to subdomains ending in `example.com` |

When selecting a cookie, choose the exact cookie entry that represents the value you want to sync. Headerly stores the selected cookie's actual domain and path, not only the text you typed into the domain input.

## How the Cookie Header Is Built

Sync Cookies appends enabled, non-empty cookies to the request `Cookie` header. Internally, each selected cookie becomes a DNR request-header modification similar to:

```http
Cookie: selected_name=selected_value
```

If the original request already contains a cookie with the same name, the synchronized cookie value takes precedence in practice because it is appended later.

Example:

```txt
Original Cookie header:
test_cookie=old; other_cookie=keep

Synchronized cookie:
test_cookie=new

Result:
other_cookie=keep; test_cookie=new
```

::: info Empty cookie values
Cookies with an empty string value are not appended to requests. If the source cookie is missing, deleted, expired, or cannot be read, Headerly treats its value as empty.
:::

## Synchronization Behavior

Headerly synchronizes cookie values in two ways:

- When the extension starts or cookie permissions are granted, it reads the current values for configured sync cookies.
- While the browser is running, it listens for cookie changes and updates matching sync-cookie items.

Cookie changes may arrive in bursts, so Headerly batches updates briefly before writing them back to profile storage.


## Troubleshooting

### The Cookie Selector Is Empty

Check the following:

- The domain input is correct.
- The cookie actually exists in the current browser profile.
- The cookie domain matches the domain you entered. For example, `app.example.com` and `example.com` may show different cookie sets.

### The Selected Cookie Shows as Missing

The cookie may have been deleted, expired, or replaced with a different domain/path combination. Reopen the selector and choose the current cookie entry again.

### The Request Does Not Include the Synced Cookie

Verify that:

- The Sync Cookies item is enabled.
- The source cookie value is not empty.
- The profile itself is enabled.
- The profile filters match the target request URL, resource type, method, and other conditions.
- No other request-header rule removes or overwrites the `Cookie` header afterward.

### The Cookie Value Keeps Changing

That is expected when the source website rotates or refreshes the cookie. Sync Cookies is intentionally linked to the source cookie. Use a normal request-header modification if you need a fixed value.

## Limitations

Sync Cookies identifies cookies by `domain + path + name`. This works for common cookies, but it cannot uniquely represent every advanced browser cookie scenario.

Known limitations:

- [Partitioned cookies / CHIPS](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies/Partitioned_cookies) are not fully represented by `domain + path + name`, because the same cookie can have separate values in different partition contexts.
- Incognito windows use separate cookie stores. The same `domain + path + name` may refer to different values across regular and incognito contexts.

For most regular first-party cookies in a normal browser window, these limitations do not apply.
