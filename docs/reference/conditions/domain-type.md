# Domain type

`domainType` selects whether a request is first-party or third-party relative to the domain from which it originated.

| Value | Meaning |
| --- | --- |
| `firstParty` | The request is first-party to its originating domain |
| `thirdParty` | The request is third-party to its originating domain |

When the condition is disabled or absent, both types can match.

Domain Type is a relationship test. It is not a substitute for explicit [Request domains](/reference/conditions/request-domains), [Initiator domains](/reference/conditions/initiator-domains), or [Top-level domains](/reference/conditions/top-level-domains).
