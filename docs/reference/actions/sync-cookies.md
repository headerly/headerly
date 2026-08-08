# Synchronize cookies

Cookie synchronization is a Headerly action component available to `modifyHeaders` profiles. It reads a selected browser cookie and appends `name=value` to the outgoing `Cookie` header.

## Fields

| Field | Purpose |
| --- | --- |
| Domain | Exact domain recorded for the selected cookie, including any leading dot |
| Path | Exact cookie path |
| Name | Cookie name |
| Value | Current value copied from the browser cookie store |

## Domain and host-only scope

Chrome exposes both a `domain` string and a `hostOnly` boolean for each cookie. Chromium's cookie representation encodes the same host-only distinction in the `domain` string:

| Domain value | Chrome property | Scope |
| --- | --- | --- |
| `example.com` | `hostOnly: true` | Matches only the exact `example.com` host |
| `.example.com` | `hostOnly: false` | Domain cookie that can match `example.com` and its subdomains |

The leading dot does not represent a separate `hostname` property. It is Chromium's domain-string representation of the cookie's `hostOnly` scope. Headerly stores the exact `domain` value returned by Chrome instead of storing `hostOnly` separately.

For this reason, the Domain value must exactly match the **Domain** column in Developer Tools > **Application** > **Cookies**. If that column contains `.example.com`, the dot is part of Headerly's cookie identity and must not be omitted.

## Cookie identity

Headerly uses `domain + path + name` as the composite identity of a synchronized cookie. All three fields are required because cookies with the same name can coexist under different domains or paths. The exact domain string also distinguishes a host-only cookie from a domain cookie, so these identities are different:

```text
example.com  + / + session
.example.com + / + session
```

Headerly uses this composite identity when reading the current value and processing cookie-change events. If the domain, leading dot, path, or name differs, Headerly treats it as another cookie. When no exact match exists, the synchronized value becomes empty and no Cookie header modification is generated.

Empty names, paths, domains, or values do not produce a header modification. Multiple profile items may intentionally use the same composite identity; they will follow the same browser cookie.

## Synchronization

Headerly reads configured cookie values when the extension starts, when cookie permission is granted, and when cookie identities change. It also listens for cookie changes.

Deleting or expiring a cookie clears the stored value. Chrome can report an overwrite as a removal followed by an insertion; Headerly retains the latest observed change.

## Export and import

Headerly clears synchronized Cookie values when generating exported JSON, downloaded profiles, and share links. Domain, Path, and Name remain in the export as the Cookie identity.

After import, Headerly uses that identity to read the matching Cookie from the current user's browser. Different users can therefore use the same exported profile while Headerly synchronizes a different local value for each user. If no exact local match exists, Value remains empty and no Cookie header modification is generated.

## Permission

This feature requires the optional `cookies` permission and host access for the cookie's domain. See [Permissions](/reference/permissions).

## Limitations

The Chrome Cookies API can distinguish cookie stores and partitioned cookies with `storeId` and `partitionKey`. Headerly does not store those fields. Therefore the identity is not sufficient to distinguish every **[Cookies Having Independent Partitioned State (CHIPS, also known as )](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies/Partitioned_cookies)**,  or regular-versus-incognito case.

Headerly explicitly appends the selected value to matching requests. Restrict the profile conditions carefully; the source cookie's Domain, Path, SameSite, and Secure attributes do not define the target requests selected by the Headerly profile.

## Sources

- [Chrome Cookies API](https://developer.chrome.com/docs/extensions/reference/api/cookies)
