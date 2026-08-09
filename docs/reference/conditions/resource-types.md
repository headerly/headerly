# Resource types

Resource-type conditions select requests by their browser resource category.

## Fields

- `resourceTypes` includes the selected types.
- `excludedResourceTypes` excludes the selected types.

Use one field or the other. Enabled items are combined and duplicate values are removed.

## Values

`main_frame`, `sub_frame`, `stylesheet`, `script`, `image`, `font`, `object`, `xmlhttprequest`, `ping`, `csp_report`, `media`, `websocket`, `webtransport`, `webbundle`, `other`.

`xmlhttprequest` includes requests Chrome classifies as XMLHttpRequest or Fetch traffic. Classification is performed by the browser.

## Headerly default

For every rule except `allowAllRequests`, when neither field contains a value, Headerly explicitly adds every resource type to the registered rule. This keeps rules broadly usable: Chrome's default DNR behavior applies to only a small subset of resource types, which can make a rule appear not to apply.

Headerly does not offer a setting for Chrome's native default behavior. To narrow a rule's scope, add a Resource Types or Excluded Resource Types condition and select one or more values.

`allowAllRequests` does not receive a default resource-type list. See [Allow all requests](/reference/actions/allow-all-requests).
