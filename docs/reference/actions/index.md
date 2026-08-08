# Actions

An action defines what Chrome does when every enabled condition in a profile matches.

| Action type | Result | Additional configuration |
| --- | --- | --- |
| [`modifyHeaders`](/reference/actions/modify-headers) | Modifies request or response headers | At least one valid header modification or synchronized cookie |
| [`redirect`](/reference/actions/redirect) | Redirects the request | One enabled, non-empty destination URL |
| [`block`](/reference/actions/block) | Blocks the request | None |
| [`allow`](/reference/actions/allow) | Exempts the request from lower-priority Headerly rules | None |
| [`upgradeScheme`](/reference/actions/upgrade-scheme) | Upgrades an insecure URL scheme | None |
| [`allowAllRequests`](/reference/actions/allow-all-requests) | Allows a complete frame hierarchy | A frame resource type |

Changing a profile's action type removes configuration that is incompatible with the new type. Conditions and priority remain unless changed separately.

`block`, `allow`, `upgradeScheme`, and `allowAllRequests` are complete actions by themselves. `modifyHeaders` and `redirect` are registered only after their required configuration is valid.
