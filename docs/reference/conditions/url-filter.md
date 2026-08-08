# URL filter

`urlFilter` matches the complete network-request URL using Chrome's compact filter syntax.

## Tokens

| Token | Meaning |
| --- | --- |
| `*` | Any number of characters |
| `|` | Start or end of the URL when placed at the corresponding edge |
| `||` | Start of a domain or subdomain when placed first |
| `^` | A separator character or the end of the URL |

Examples:

```text
||example.com/
|https://api.example.com/
example.com/path
```

Use `||example.com/` instead of `example.com` when the intent is to match a domain. An unanchored value can also match text in a path or query string.

The filter must be non-empty ASCII. Internationalized hosts are matched in Punycode form and other non-ASCII URL characters are percent-encoded.

Only one of `urlFilter` and `regexFilter` can be generated. The UI prevents both from being configured; if imported data contains both, an enabled non-empty Regex Filter takes precedence.

See Chrome's [URL filter syntax](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#url-filter-syntax).
