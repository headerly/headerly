# Profile Groups Domain Model

## Decision

Profile groups are stored as sidebar organization metadata. A profile may point to one group with an optional `groupId`; group records live in a separate `profileGroups` storage item.

Groups do not participate in Declarative Net Request rule generation. They only affect sidebar presentation and profile enablement behavior.

Sidebar grouping is a projection over `profiles`, not a storage invariant. A profile belongs to a group only through its `groupId`; group membership must not be inferred from profiles being adjacent in the `profiles` array.

## Entities

- `Profile`: existing rule configuration. The optional `groupId` assigns it to a profile group.
- `ProfileGroup`: named UI group with a color and a `radio` or `checkbox` type.
- `ProfileManager`: owns profile order and the selected profile.
- `ProfileGroups`: owns group metadata, keyed by `Profile.groupId`.

## Behavior

When a profile in a `radio` group is resumed, every other profile in that group is paused. `checkbox` groups allow any number of enabled profiles.

Deleting a group removes the group record and clears `groupId` from its profiles. It does not delete profiles.

Ungrouping a profile clears only that profile's `groupId`.

Profile sharing intentionally excludes group membership for now. Since groups are not exported, exporting a dangling `groupId` would create misleading imported data.

Dragging profiles in the sidebar rewrites the profile manager's `profiles` array. Each group is an independent sorting container, and the group header is also a top-level sorting handle that moves the whole group among ungrouped profiles and other groups. After a drag, the persisted array order should match the sidebar's flattened display order.

A group block's top-level position is the position of the first profile in `profiles` that points to that `groupId`. Profiles inside the block are gathered by `groupId`, not by adjacency.
