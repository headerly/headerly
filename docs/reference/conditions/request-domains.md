# Request domains

Request-domain conditions compare against the domain of the requested URL.

## `requestDomains`

The rule matches only requests whose destination domain is in the enabled list.

## `excludedRequestDomains`

The rule does not match requests whose destination domain is in the enabled list. Exclusions take precedence over included request domains.

Entries contain domain names only, not schemes, ports, paths, or query strings. Headerly extracts the hostname when a URL is pasted. Subdomains of an entry also match. Values must be ASCII; use Punycode for internationalized names.

Example: `example.com` also matches `api.example.com`.

Use [Initiator domains](/reference/conditions/initiator-domains) to match the site that started a request, rather than its destination.
