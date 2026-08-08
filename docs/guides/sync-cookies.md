# Synchronize a cookie into requests

Use cookie synchronization when a request header must follow the current value of a browser cookie. Cookie sync is a convenience wrapper around a **Modify request header** action using the `append` operation: Headerly supplies the current local cookie value instead of requiring a fixed header value.

::: warning Sensitive access
This feature requests the optional `cookies` permission. Cookie values can contain sessions and credentials. Keep the target conditions narrow so the copied value is appended only to intended requests.
:::

1. Select a `modifyHeaders` profile.
2. Add **Cookie sync to request header**.
3. Grant the Cookies permission when prompted. (Your browser may grant it automatically; if no permission prompt appears, skip this step.)
4. Enter the source domain or paste a URL from that domain. Make sure the resulting Domain exactly matches the **Domain** column in Developer Tools > **Application** > **Cookies**. Preserve any leading dot: if DevTools shows `.example.com`, do not enter `example.com` without the dot.
5. Select the exact cookie, including its domain and path.
6. Add conditions that identify only the requests that should receive it.
7. Send a target request and inspect its `Cookie` request header.

Headerly appends the selected cookie as `name=value`. When the source cookie changes, Headerly updates the stored value. A missing, deleted, expired, or empty cookie is not appended.

## Reuse the profile on another computer

For security, Headerly does not include synchronized Cookie values in exported JSON, downloaded profiles, or share links. It exports the Cookie identity—Domain, Path, and Name—with an empty Value.

After another user imports the profile and grants Cookie access, Headerly uses that identity to find the matching Cookie in their browser and synchronizes their local value. This lets multiple users reuse the same profile configuration without transferring Cookie credentials. The matching Cookie must already exist locally, and its Domain, Path, and Name must match exactly.

Use a normal request-header modification when the value should remain fixed. See [Synchronize cookies reference](/reference/actions/sync-cookies) for identity and partitioning limitations.
