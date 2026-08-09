# Block

`block` stops a matching network request.

::: danger Add conditions before enabling
A Block profile with no conditions applies to requests from every browser page. Enabling it can prevent all pages from opening.
:::

The action has no additional fields. A profile with this action is registerable as soon as the profile is enabled, even if it has no conditions. Headerly displays a warning for global profiles.

Within Headerly, an `allow` or `allowAllRequests` rule of equal or higher priority takes precedence over Block. Across extensions, Chrome gives Block higher action precedence than Redirect, Upgrade Scheme, Allow, or Allow All Requests.

Use narrow [conditions](/reference/conditions/) and verify the result in Developer Tools.
