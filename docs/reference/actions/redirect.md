# Redirect

`redirect` sends a matching request to one fixed destination URL.

## Destination

Headerly uses the first enabled, non-empty redirect item. Leading and trailing whitespace is removed. An empty destination prevents the profile from registering.

Use an absolute HTTP or HTTPS URL. JavaScript URLs are not accepted by Chrome.

## Supported form

Headerly exposes only the DNR `redirect.url` form. It does not expose:

- `extensionPath`;
- `regexSubstitution`;
- URL `transform` or `queryTransform`.

Capture groups in a `regexFilter` therefore cannot be inserted into the destination.

## Interactions

Redirect participates in DNR priority resolution. A matching higher-priority `allow`, `allowAllRequests`, or `block` profile can prevent it from running. A destination that also matches the source condition can create a loop.

See Chrome's [Redirect type](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#type-Redirect).
