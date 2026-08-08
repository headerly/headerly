# Regular expression filter

`regexFilter` matches the complete network-request URL with Chrome's RE2 regular-expression engine.

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

Only one of `regexFilter` and `urlFilter` can be used. See [URL case sensitivity](/reference/conditions/url-case-sensitivity).

Sources: [Chrome DNR regexFilter](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#type-RuleCondition) and [RE2](https://github.com/google/re2).
