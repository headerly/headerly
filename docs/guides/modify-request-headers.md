# Modify request headers

Use a request-header rule to change headers before the browser sends a matching request.

1. Create or select a `modifyHeaders` profile.
2. Add **Modify request header** if the profile does not already contain it.
3. Enter the header name.
4. Choose an operation:

   - `set` to create or replace the value;
   - `append` to add a value to an allowed request header;
   - `remove` to delete the header.

5. Enter a non-empty value for `set` or `append`.
6. Add conditions that limit the affected requests.
7. Reload the target page and inspect the request in Developer Tools.

::: warning Append is restricted
Chrome permits `append` only for a fixed, case-sensitive list of request-header names. Use `set` when the header is not on that list. See [Modify headers reference](/reference/actions/modify-headers#append-restrictions).
:::

When profiles modify the same header, set explicit [priorities](/reference/priorities) and verify the final request.
