# Registration errors

Headerly stores DNR registration errors against the profile that produced them. The profile remains editable but does not have a working registered rule until the error is corrected.

Common causes include:

- unsupported or overly complex RE2 syntax;
- `append` applied to a request header outside Chrome's allowlist;
- an invalid redirect URL;
- an action with no valid required data;
- incompatible include and exclude conditions;
- a condition value unsupported by the current browser;
- Chrome rule or regular-expression quotas.

Correct the highlighted profile and let Headerly register it again. If the error remains after the profile is valid, run **Reinitialize all rules** in Settings.

Reinitialization removes and rebuilds Headerly rules. It does not change Chrome's API limits and cannot resolve conflicts caused by another extension.

For Regex errors, remove JavaScript `/.../` delimiters and unsupported look-around or backreference syntax. See [Regular expression filter](/reference/conditions/regex-filter).
