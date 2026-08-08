# Unexpected matches

## URL Filter is too broad

An unanchored value can match in the path or query. Prefer `||example.com/` for a domain and `|https://example.com/` for one exact scheme and host.

## Domain matches subdomains

Request, initiator, and top-level domain entries also match subdomains. Use URL Filter or Regex Filter when the boundary must be narrower.

## The wrong domain perspective is used

- Request Domains examine the destination URL.
- Initiator Domains examine what started the request.
- Top-level Domains examine the surrounding top-level page.

Choose the perspective that represents the intended restriction.

## No Resource Type is configured

By default, Headerly explicitly matches all resource types. Add Resource Types to narrow the rule, or enable native DNR resource-type behavior in Settings if that is the desired default.

## A global profile is enabled

A profile with no effective conditions can affect every request supported by DNR. Add at least one narrow condition unless global behavior is intentional.
