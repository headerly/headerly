# Allow all requests

`allowAllRequests` allows the matching frame request and future requests in that frame hierarchy. It is broader than [`allow`](/reference/actions/allow), which applies to one request.

## Resource types

Chrome requires `allowAllRequests` rules to use only:

- `main_frame`
- `sub_frame`

Headerly does not add resource types automatically for this action. If you add a Resource Types or Excluded Resource Types condition, select only these values.

## Priority

Once a frame matches, an Allow All Requests rule can suppress lower-priority Headerly actions for requests in that frame. Use a narrow URL or domain condition and an intentional priority.

The action has no additional fields.
