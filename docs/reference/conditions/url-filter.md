# URL filter

`urlFilter` matches the complete network-request URL using Chrome's compact filter syntax.

::: warning Prefer Request domains when possible
Use [Request domains](/reference/conditions/request-domains) unless it cannot express the match you need. Request domains are simpler, more predictable, and support multiple enabled values in checkbox mode. `urlFilter` is limited to one enabled value because of the underlying API; complex filters are harder to troubleshoot.
:::

## Tokens

| Token | Meaning |
| --- | --- |
| `*` | Any number of characters |
| `\|` | Start or end of the URL when placed at the corresponding edge |
| `\|\|` | Start of a domain or subdomain when placed first |
| `^` | A separator character or the end of the URL |

Examples:

```text
||example.com/
|https://api.example.com/
example.com/path
```

Use `||example.com/` instead of `example.com` when the intent is to match a domain. An unanchored value can also match text in a path or query string.

The filter must be non-empty ASCII. Internationalized hosts are matched in Punycode form and other non-ASCII URL characters are percent-encoded.

Only one of `urlFilter` and `regexFilter` can be generated. The UI prevents both from being configured; if imported data contains both, an enabled non-empty Regex Filter takes precedence. `urlFilter` itself also supports only one enabled value, not checkbox-style multiple selection.

## Troubleshooting

Consult Chrome's [URL filter syntax](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#url-filter-syntax) for the complete grammar. Headerly passes the configured filter to Chrome's DNR API after trimming leading and trailing whitespace. If a filter does not match as expected, check that syntax and Chrome's matching behavior; Headerly does not reinterpret the value.
