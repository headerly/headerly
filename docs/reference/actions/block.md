# Block

`block` stops a matching network request.

The action has no additional fields. A profile with this action is registerable as soon as the profile is enabled, even if it has no conditions. A conditionless Block profile affects all requests matched by DNR and can break browser pages; Headerly displays a warning for global profiles.

Within Headerly, an `allow` or `allowAllRequests` rule of equal or higher priority takes precedence over Block. Across extensions, Chrome gives Block higher action precedence than Redirect, Upgrade Scheme, Allow, or Allow All Requests.

Use narrow [conditions](/reference/conditions/) and verify the result in Developer Tools.
