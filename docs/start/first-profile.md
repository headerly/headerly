# Create your first profile

In this tutorial, we will add a request header to requests sent to the current website.

## Before you start

- Install Headerly.
- Open a normal HTTP or HTTPS page.
- Open the Headerly popup from the browser toolbar.

## Create the rule

1. Create a `modifyHeaders` profile.
2. Name it `Headerly demo`.
3. Keep the generated **Request domains** condition. Confirm that it contains the current site's hostname.
4. In **Modify request header**, enter:

   - Name: `X-Headerly-Demo`
   - Operation: `set`
   - Value: `enabled`

5. Keep the profile enabled.

Headerly registers the profile automatically. The active-rule badge should include this profile.

## Check the result

1. Open the browser's Developer Tools.
2. Select the **Network** panel.
3. Reload the page.
4. Select a request sent to the configured hostname.
5. Inspect its request headers.

You should see:

```http
X-Headerly-Demo: enabled
```

If the header is absent, follow [Rule not applied](/troubleshooting/rule-not-applied).

## Remove the change

Pause the profile. Reload the page and confirm that the header is no longer present.

You have created, verified, and paused a complete Headerly profile. Next, see the guides for [request headers](/guides/modify-request-headers) and [conditions](/reference/conditions/).
