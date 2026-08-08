# Initiator domains

Initiator-domain conditions compare against the origin that initiated a request, not the requested URL.

## `initiatorDomains`

The rule matches only requests initiated by a listed domain.

## `excludedInitiatorDomains`

The rule excludes requests initiated by a listed domain. Exclusions take precedence over included initiator domains.

Subdomains match. Entries must be ASCII domain names; use Punycode for internationalized names.

Headerly always adds its own extension ID to `excludedInitiatorDomains`. This internal exclusion prevents profiles from affecting Headerly's extension pages and requests.

Requests do not always have a conventional website initiator. Test Service Worker and extension-generated requests separately when initiator matching matters.
