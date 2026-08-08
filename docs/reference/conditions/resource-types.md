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

If neither field produces a value and **Use native DNR resource type behavior** is off, Headerly explicitly adds all resource types. For `allowAllRequests`, it adds only `main_frame` and `sub_frame`, as required by Chrome.

When the setting is on, Headerly omits both fields and uses Chrome's narrower native default behavior.
