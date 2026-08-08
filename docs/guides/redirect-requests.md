# Redirect requests

Use a Redirect profile to send matching requests to one fixed URL.

1. Create a `redirect` profile.
2. Enter an absolute HTTP or HTTPS destination in **Simple redirect URL**.
3. Add conditions that identify the source requests.
4. Enable the profile and load a matching URL.
5. Confirm the final URL and requested resource in Developer Tools.

Headerly does not currently expose DNR URL transforms, extension-path redirects, or regular-expression substitutions. The destination is used as written.

::: warning Redirect loops
Ensure the destination does not also match the source conditions unless another condition breaks the cycle.
:::

See [Redirect reference](/reference/actions/redirect).
