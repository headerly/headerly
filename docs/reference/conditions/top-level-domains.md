# Top-level domains

Top-level-domain conditions compare against the domain of the associated top-level frame.

## `topDomains`

The rule matches only when the top-level frame belongs to a listed domain.

## `excludedTopDomains`

The rule excludes requests associated with a listed top-level domain. Exclusions take precedence over included top-level domains.

Subdomains match. Values must be ASCII domain names; use Punycode for internationalized names. For a request without an associated top-level frame, such as some Service Worker requests, Chrome uses the initiator domain instead.

These fields require Chrome 145, which is also Headerly's current minimum Chrome version.

Use this condition when the same third-party resource should be modified only while it is used by a particular top-level site.
