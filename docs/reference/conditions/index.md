# Conditions

Conditions select the network requests to which a profile applies. Different condition types are combined with logical AND. Multiple enabled values within a condition usually broaden that condition; excluded variants remove matches.

| Condition | Field |
| --- | --- |
| [URL filter](/reference/conditions/url-filter) | `urlFilter` |
| [Regular expression filter](/reference/conditions/regex-filter) | `regexFilter` |
| [URL case sensitivity](/reference/conditions/url-case-sensitivity) | `isUrlFilterCaseSensitive` |
| [Request domains](/reference/conditions/request-domains) | `requestDomains`, `excludedRequestDomains` |
| [Initiator domains](/reference/conditions/initiator-domains) | `initiatorDomains`, `excludedInitiatorDomains` |
| [Top-level domains](/reference/conditions/top-level-domains) | `topDomains`, `excludedTopDomains` |
| [Domain type](/reference/conditions/domain-type) | `domainType` |
| [Resource types](/reference/conditions/resource-types) | `resourceTypes`, `excludedResourceTypes` |
| [Request methods](/reference/conditions/request-methods) | `requestMethods`, `excludedRequestMethods` |
| [Tab IDs](/reference/conditions/tab-ids) | `tabIds`, `excludedTabIds` |
| [Tab groups](/reference/conditions/tab-groups) | `tabGroups`, `excludedTabGroups` |

Disabled or empty items do not contribute to a generated rule. If no conditions remain, the profile is global. Headerly always excludes its own extension ID from initiator-domain matching to avoid applying rules to itself.
