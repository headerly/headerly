# Block or allow requests

## Block matching requests

1. Create a `block` profile.
2. Add conditions for the requests to stop.
3. Enable the profile and reproduce the request.
4. Confirm in Developer Tools that the request was blocked.

## Exempt traffic from other profiles

Create an `allow` profile when matching traffic should bypass lower-priority blocking, redirect, upgrade, or header-modification rules from Headerly.

1. Create an `allow` profile.
2. Add narrow conditions for the exception.
3. Give it a priority at least as high as the rules it must override.
4. Verify the request and all expected headers.

Use `allowAllRequests` only when you need an exception for a complete frame hierarchy. See [Allow](/reference/actions/allow), [Allow all requests](/reference/actions/allow-all-requests), and [priority behavior](/explanation/priority-and-conflicts).
