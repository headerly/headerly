# How Headerly uses Declarative Net Request

Headerly does not proxy network traffic. It translates each enabled profile into a declarative rule and asks Chrome to register that rule.

A DNR rule contains an integer ID, priority, action, and condition. Headerly owns the mapping between its UUID-based profile IDs and Chrome's integer rule IDs. When a rule-relevant profile field changes, the background worker computes the changed profiles and updates only their registered rules.

Chrome evaluates those rules inside the browser network stack. This design lets the browser apply actions without sending request or response bodies to Headerly's JavaScript code.

## Rule lifecycle

1. Headerly stores the profile locally.
2. Enabled, registerable profiles are converted into DNR actions and conditions.
3. Headerly adds or updates dynamic or session rules.
4. Registration IDs and errors are stored for the popup.
5. The toolbar badge reflects active registered rules.

Pausing a profile removes its rule. Turning off Headerly removes all Headerly rules. Reinitialization removes and rebuilds them from the saved profiles.

See [Profiles](/reference/profiles) and Chrome's [Declarative Net Request API](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest).
