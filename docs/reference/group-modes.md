# Radio and checkbox groups

Headerly uses the same two selection modes for action items, condition items, and profile groups.

## Checkbox

Multiple items can be enabled simultaneously. Use Checkbox when values should be combined, such as several request domains or header modifications.

## Radio

Only one item can be enabled. Adding or enabling one item disables the others. Use Radio for mutually exclusive alternatives, such as one active configuration value.

## Effect on generated rules

The group type is an editor and storage behavior. The generated DNR rule contains only the enabled values; it does not contain the words `radio` or `checkbox`.

Disabled items remain available in the profile but do not affect matching or actions.
