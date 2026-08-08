# Profile groups

Profile groups organize top-level profiles and optionally coordinate which profiles are enabled.

## Fields

| Field | Description |
| --- | --- |
| Name | User-visible group name |
| Color | Sidebar color selected from Headerly presets |
| Type | `checkbox` or `radio` |
| Remembered profiles | Internal list used by Pause and remember |

## Checkbox groups

Any number of profiles in a checkbox group can be enabled. Enabling or disabling one profile does not automatically change the others.

## Radio groups

At most one profile in a radio group can be enabled. Enabling a profile disables other enabled profiles in the same group.

## Pause and resume

**Pause and remember** disables the group and records which profiles were enabled. **Resume saved profiles** restores every remembered profile in a checkbox group or the first remembered profile in a radio group.

Changing a member profile's enabled state separately clears the remembered state.

## Sidebar context menus

Right-click a profile emoji in the Sidebar to open its context menu. From there, you can pause or resume the profile, duplicate it, change its group membership, edit comments or priority, change its action type, export it, or delete or reset it.

Right-click a profile group header to open the group context menu. From there, you can edit the group's name and color, switch between radio and checkbox mode, create a profile in the group, pause or resume remembered profiles, remove all profiles from the group, or delete the group.

## Storage and export

Groups and memberships are local organizational data. They do not affect DNR rule contents and are not included in profile exports. Removing the final member causes an empty group to be cleaned up.
