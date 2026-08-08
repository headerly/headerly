# Allow

`allow` exempts an individual matching request from lower-priority Headerly rules.

The action has no additional fields. When an Allow profile matches, Headerly rules with lower priority do not block, redirect, upgrade, or modify headers for that request.

Allow does not create a network request that another browser policy, server, or extension has blocked. Rule ordering between separate extensions follows Chrome's cross-extension conflict rules.

Use [Allow all requests](/reference/actions/allow-all-requests) when the exception must cover a complete frame hierarchy.
