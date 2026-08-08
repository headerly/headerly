# Rule not applied

Check the profile from top to bottom.

1. Confirm that Headerly is turned on.
2. Confirm that the profile and the required group item are enabled.
3. Confirm that the action is registerable:

   - `modifyHeaders` needs a non-empty header name and, except for `remove`, a non-empty value;
   - `redirect` needs an enabled, non-empty destination;
   - synchronized cookies need a valid identity and non-empty current value.

4. Check every enabled condition. Different condition types must all match.
5. For URL matching, test the complete request URL rather than the page URL.
6. Check the request's Resource Type and Request Method in Developer Tools.
7. For Tab or Tab Group conditions, confirm that the tab is still bound and the profile has not been disabled after the binding became empty.
8. Check the profile for a registration error.
9. Check whether a higher-priority Allow or Allow All Requests profile suppresses the action.
10. Pause other network-modifying extensions and retry.

If the profile is valid but its rule state appears stale, open Settings and run **Reinitialize all rules**. This rebuilds rules without deleting profiles.
