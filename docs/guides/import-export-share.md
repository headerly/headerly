# Import, export, and share profiles

## Export profiles

1. Open the Export page from a profile's **Share** action.
2. Select the profiles to include.
3. Copy the JSON, download it, or create a Headerly share link.
4. Review the exported values before sending them to anyone.

Internal IDs, profile-group membership, tab IDs, and tab-group conditions are removed from exported profiles.

::: danger Review secrets
Synchronized Cookie values are cleared automatically. Header values, comments, and redirect URLs are not redacted and can still contain private information.
:::

## Import profiles

1. Open the Import page.
2. Paste JSON, choose an exported file, or open a Headerly share link.
3. Review validation errors and the profiles to be added.
4. Confirm the import.

Imported profiles receive new internal IDs and do not overwrite profiles with similar names. Imports containing synchronized cookies can request the optional Cookies permission.

See [Import and export format](/reference/import-export-format) for the versioned schema.
