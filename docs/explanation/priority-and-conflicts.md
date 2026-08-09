# Priority and conflicts

Several profiles can match the same request. Chrome resolves them in stages, not as one flat list.

## Before the request

For Headerly rules, Chrome first compares priority. At the same priority, action precedence is:

1. Allow and Allow All Requests
2. Block
3. Upgrade Scheme
4. Redirect

An Allow action prevents lower-priority Headerly actions from affecting that request. Allow All Requests can extend that exemption through a frame hierarchy.

When multiple extensions compete, Chrome uses a different action ordering and installation recency can decide ties. Headerly cannot guarantee the outcome of another extension's rules.

## Header modification

Header changes occur later. Matching Modify Headers rules above any applicable Allow priority are processed from higher to lower priority. Earlier operations constrain later changes to the same header:

- Append permits only later appends.
- Set permits only later appends from the same extension.
- Remove permits no later modification.

## Practical model

Assign higher priorities to narrow exceptions and lower priorities to broad defaults. Avoid equal priority when order matters. Verify the final request because browser policy and other extensions remain outside Headerly's control.

See [Priorities](/reference/priorities) and Chrome's [rule evaluation](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#rule-evaluation).
