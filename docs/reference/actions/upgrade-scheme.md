# Upgrade scheme

`upgradeScheme` replaces an insecure request scheme with its secure equivalent before the request is sent.

Chrome upgrades HTTP to HTTPS and FTP to HTTPS. The host, path, query, and fragment remain otherwise unchanged. The destination server must support the secure URL.

The action has no additional fields. Conditions determine which requests are eligible. Higher-priority Allow, Allow All Requests, or Block profiles can prevent the upgrade.

This action is classified as a safe DNR action and is subject to Chrome's safe dynamic-rule quota.
