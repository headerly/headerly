# Synchronize a cookie into requests

Use cookie synchronization when a request header must follow the current value of a browser cookie.

::: warning Sensitive access
This feature requests the optional `cookies` permission. Cookie values can contain sessions and credentials. Never share an exported profile without reviewing its contents.
:::

1. Select a `modifyHeaders` profile.
2. Add **Cookie sync to request header**.
3. Grant the Cookies permission when prompted.
4. Enter the source domain or paste a URL from that domain.
5. Select the exact cookie, including its domain and path.
6. Add conditions that identify only the requests that should receive it.
7. Send a target request and inspect its `Cookie` request header.

Headerly appends the selected cookie as `name=value`. When the source cookie changes, Headerly updates the stored value. A missing, deleted, expired, or empty cookie is not appended.

Use a normal request-header modification when the value should remain fixed. See [Synchronize cookies reference](/reference/actions/sync-cookies) for identity and partitioning limitations.
