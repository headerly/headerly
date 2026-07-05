---
title: Getting Started
---

# Getting Started

Headerly manages browser Declarative Net Request rules through profiles. A profile describes what request should match, which action should run, and how strongly that rule should be prioritized when multiple rules could apply.

## Core Concepts

### Profile

A profile is the top-level unit you create and enable in Headerly. Each profile becomes a browser DNR rule when it is valid and enabled.

A profile contains:

- A rule action type, which decides what the browser does when the rule matches.
- A priority, which helps the browser choose between matching rules.
- Conditions, which decide which requests the rule applies to.
- Actions, such as header modifications, redirects, blocks, or allows.

### Rule Action Type

The rule action type is the main behavior of a profile.

Headerly supports these action types:

- `modifyHeaders`: modify request headers, response headers, or synced cookie headers.
- `redirect`: redirect matching requests to another URL.
- `block`: block matching requests.
- `allow`: allow matching requests.
- `upgradeScheme`: upgrade matching requests from `http` to `https`.
- `allowAllRequests`: allow all requests from the same frame after the rule matches.

For most header workflows, use `modifyHeaders`.

### Priority

Priority is a number used by the browser when more than one DNR rule matches the same request. Higher-priority rules are considered before lower-priority rules.

Use priority when profiles overlap. For example, a broad default profile can use a lower priority, while a more specific project or domain profile can use a higher priority.

If you are not sure what to choose, keep the default priority and only adjust it after you create overlapping profiles.

## Conditions

Conditions decide whether a profile should run for a request. A profile with fewer conditions matches more requests. A profile with more conditions is more specific.

Common condition types include:

- URL filter: a browser DNR URL pattern.
- Regular expression filter: a regex-based URL matcher.
- Request domains: domains the request is sent to.
- Excluded request domains: domains the request must not be sent to.
- Initiator domains: domains that initiated the request.
- Excluded initiator domains: initiator domains to ignore.
- Resource types: request categories such as document, script, image, font, websocket, or XHR.
- Request methods: methods such as `GET`, `POST`, `PUT`, or `DELETE`.
- Domain type: first-party or third-party requests.
- URL filter case sensitivity.

Headerly uses enabled condition items only. Disabled items stay in the profile but do not affect rule generation.

## Actions

Actions describe what happens after the conditions match.

### Header Modification

For `modifyHeaders` profiles, Headerly can modify request and response headers.

Each header modification has:

- `Name`: the header name.
- `Operation`: how the header should be changed.
- `Value`: the value used by `set` or `append`.

Supported operations:

- `set`: replace the header value or create the header if possible.
- `append`: append a value to the existing header.
- `remove`: remove the header. This operation does not need a value.

Request header modifications run on outgoing requests. Response header modifications run on incoming responses.

### Sync Cookies

Sync Cookies is a request-header workflow that appends selected browser cookies to the outgoing `Cookie` header. It requires the optional cookies permission.

Use Sync Cookies when the value should follow a real browser cookie. Use a normal request header modification when you want a fixed cookie string.

### Redirect URL

For `redirect` profiles, Headerly uses the enabled redirect URL item as the destination. Redirect profiles should usually have specific conditions so they do not redirect too broadly.

## Radio and Checkbox Groups

Headerly uses two group modes for selectable items:

- `radio`: only one item in the group should be enabled at a time.
- `checkbox`: multiple items in the group can be enabled at the same time.

Use `radio` when the group represents alternatives, such as one active redirect target. Use `checkbox` when several items should run together, such as multiple header modifications.

## Import and Export

Headerly can export profiles to JSON and import them later.

Export is useful for:

- Backing up local profiles.
- Moving profiles to another browser profile or device.
- Sharing a known setup with teammates.

When profiles are exported, Headerly removes internal IDs from the profile data and wraps the result with a version number. When profiles are imported, Headerly validates the data and generates new IDs. This keeps imported profiles separate from existing local profiles.

## Suggested Workflow

1. Create a profile for one use case, project, or environment.
2. Choose the rule action type. Start with `modifyHeaders` for header workflows.
3. Add conditions so the profile only matches the traffic you intend to change.
4. Add the action details, such as request headers, response headers, synced cookies, or a redirect URL.
5. Keep the default priority unless this profile overlaps with another enabled profile.
6. Test the target request in the browser.
7. Export the profile when you want a backup or a shareable setup.
