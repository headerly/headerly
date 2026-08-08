# Synchronize cookies

Cookie synchronization is a Headerly action component available to `modifyHeaders` profiles. It reads a selected browser cookie and appends `name=value` to the outgoing `Cookie` header.

## Fields

| Field | Purpose |
| --- | --- |
| Domain | Exact domain recorded for the selected cookie |
| Path | Exact cookie path |
| Name | Cookie name |
| Value | Current value copied from the browser cookie store |

Headerly identifies a synchronized cookie by `domain + path + name`. Empty names, paths, domains, or values do not produce a header modification.

## Synchronization

Headerly reads configured cookie values when the extension starts, when cookie permission is granted, and when cookie identities change. It also listens for cookie changes. Changes arriving close together are batched for 500 ms before storage is updated.

Deleting or expiring a cookie clears the stored value. Chrome can report an overwrite as a removal followed by an insertion; Headerly retains the latest observed change.

## Permission

This feature requires the optional `cookies` permission and host access for the cookie's domain. See [Permissions](/reference/permissions).

## Limitations

The Chrome Cookies API can distinguish cookie stores and partitioned cookies with `storeId` and `partitionKey`. Headerly does not store those fields. Therefore the identity is not sufficient to distinguish every CHIPS, partitioned-cookie, or regular-versus-incognito case.

Headerly explicitly appends the selected value to matching requests. Restrict the profile conditions carefully; the source cookie's Domain, Path, SameSite, and Secure attributes do not define the target requests selected by the Headerly profile.

## Sources

- [Chrome Cookies API](https://developer.chrome.com/docs/extensions/reference/api/cookies)
- [Modify headers](/reference/actions/modify-headers)
