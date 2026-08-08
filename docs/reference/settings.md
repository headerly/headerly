# Settings

## Appearance

### Language

Selects the popup interface language. Headerly currently includes English and Simplified Chinese.

### Theme

`auto` follows the operating system or browser preference. `light` and `dark` select a fixed theme.

## Profiles

### Show comments inline

Displays profile comments directly in the editor instead of only through the comments action.

### Hide recently added

Hides shortcuts for recently added request and response header names.

## Declarative Net Request

### Use native DNR resource type behavior

When disabled, Headerly adds all resource types to rules that do not define Resource Types or Excluded Resource Types. When enabled, Headerly leaves both fields absent and lets Chrome use its native, narrower default.

The setting is read when Headerly registers a rule. After changing it, use **Reinitialize all rules** to apply the new behavior to existing profiles immediately.

## Troubleshooting

### Reinitialize all rules

Removes Headerly's currently registered DNR rules and rebuilds them from enabled, registerable profiles. It does not delete profiles.

Use it after checking the profile's enabled state, action, and conditions. See [Rule not applied](/troubleshooting/rule-not-applied).
