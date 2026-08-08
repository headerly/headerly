# Request methods

Request-method conditions select requests by HTTP method.

## Fields

- `requestMethods` includes the selected methods.
- `excludedRequestMethods` excludes the selected methods.

Use one field or the other. Enabled items are combined and duplicate values are removed.

## Values

`connect`, `delete`, `get`, `head`, `options`, `patch`, `post`, `put`, `other`.

Values are displayed as uppercase HTTP method names in the UI and stored in lowercase.

Specifying `requestMethods` also excludes non-HTTP(S) requests. Specifying only `excludedRequestMethods` does not have that additional effect.
