# Modify response headers

Use a response-header rule to change headers after a matching response reaches the browser.

1. Create or select a `modifyHeaders` profile.
2. Add **Modify response header**.
3. Enter the response-header name.
4. Choose `set`, `append`, or `remove`.
5. Enter a value for `set` or `append`.
6. Restrict the profile with request conditions.
7. Reload the target resource.

Common development uses include changing CORS, Content Security Policy, cache, or framing headers. Changing a response header does not change the response body or the origin server's configuration.

::: warning Security controls
Removing security headers weakens browser protections for matching traffic. Keep the conditions narrow and pause the profile when testing is complete.
:::

## Verify the modified header

::: warning Do not rely on the Network panel
Because of [Chromium issue 40196848](https://issues.chromium.org/issues/40196848), the Network panel can show the server's original response headers instead of changes made by `declarativeNetRequest`. A missing or unchanged header in that panel does not prove that the Headerly rule failed.
:::

Open Developer Tools on the target origin and run a same-origin request in the Console:

```js
const response = await fetch("/api/endpoint", { cache: "no-store" });
Object.fromEntries(response.headers.entries());
```

Replace `/api/endpoint` with a URL matched by the profile, then inspect the returned object for the modified header.

See [Modify headers reference](/reference/actions/modify-headers) for operation and priority behavior.
