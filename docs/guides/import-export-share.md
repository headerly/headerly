---
order: 70
sidebarTitle: "Import, export, and share"
---

# Import, export, and share profiles

## Export profiles

1. Open the Export page from a profile's **Share** action.
2. Select the profiles to include. Group checkboxes select all members; a partial selection shows a mixed state. You can also open Export from a group’s **Share** action.
3. Copy the JSON, download it, or create a Headerly share link.
4. Review the exported values before sending them to anyone.

Exports preserve sidebar order and profile groups, including their name, color, and mode. Selecting even one member retains the group structure; unselected members are omitted.

Internal IDs, local pause/resume history, tab IDs, and tab-group conditions are removed. Each profile’s current enabled state is preserved. Imported groups have no remembered selection and use the normal group defaults when resumed.

::: danger Review secrets
Synchronized Cookie values are cleared automatically. Header values, comments, and redirect URLs are not redacted and can still contain private information.
:::

## Import profiles

1. Open the Import page.
2. Paste JSON, choose an exported file, or open a Headerly share link.
3. Review validation errors and the profiles to be added.
4. Confirm the import.

Imported profiles and groups receive new internal IDs and do not overwrite or merge with existing items, even when their names match. Imports containing synchronized cookies can request the optional Cookies permission.

### JSON Schema

Use the [latest JSON Schema](/schema@latest.json) to validate profile files in JSON editors or other tools.
