# Regular expression filter

`regexFilter` matches the complete network-request URL with Chrome's RE2 regular-expression engine.

::: warning Prefer Request domains when possible
Use [Request domains](/reference/conditions/request-domains) unless it cannot express the match you need. Request domains are simpler, more predictable, and support multiple enabled values in checkbox mode. `regexFilter` is limited to one enabled value because of the underlying API; complex expressions are harder to troubleshoot.
:::

Enter the expression directly, without JavaScript-style `/.../` delimiters:

```text
^https://api\.example\.com/v[0-9]+/
```

## Syntax limits

RE2 deliberately omits constructs that require backtracking. In particular, it does not support:

- backreferences such as `\1`;
- positive or negative lookahead;
- positive or negative lookbehind.

Ordinary capturing and non-capturing groups are supported, but Headerly's fixed Redirect action cannot substitute their captured values.

The expression must contain only ASCII. Chrome matches it against a URL with Punycode hostnames and percent-encoded non-ASCII characters.

## Browser limits

- Each DNR ruleset type can contain at most 1,000 regular-expression rules.
- A compiled expression must use less than 2 KB.
- Unsupported syntax or excessive compiled memory causes rule registration to fail.

Chrome exposes `isRegexSupported()` for validation. Headerly currently relies on DNR registration and displays the returned registration error.

Only one of `regexFilter` and `urlFilter` can be used. `regexFilter` itself also supports only one enabled value, not checkbox-style multiple selection. See [URL case sensitivity](/reference/conditions/url-case-sensitivity).

## Troubleshooting

Consult [Chrome's DNR `regexFilter` reference](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#type-RuleCondition) and [RE2 syntax](https://github.com/google/re2/wiki/syntax) for the complete grammar. Headerly passes the configured expression to Chrome's DNR API after trimming leading and trailing whitespace. If an expression does not match as expected, check those sources and Chrome's matching behavior; Headerly does not reinterpret the value.
