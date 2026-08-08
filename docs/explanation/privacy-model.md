# Privacy model

Headerly relies on declarative browser rules. The browser applies matching actions internally; Headerly does not proxy traffic or read request and response bodies.

Profiles, settings, rule registrations, and registration errors are stored in the extension's local storage. They are not automatically uploaded by Headerly.

## Host access

Headerly has host access for all URLs so user-created profiles can target arbitrary sites. Conditions in a profile determine the requests affected by that profile.

## Cookie synchronization

Cookie synchronization is different from ordinary DNR configuration. After the optional Cookies permission is granted, Headerly reads selected cookie values and watches them for changes. Those values are stored in profiles and can be appended to matching requests.

Treat synchronized values as secrets. A profile's target conditions, not the original cookie attributes, control where the copied value is appended.

## Export and sharing

Headerly clears synchronized Cookie values before generating exported JSON, downloaded profiles, or share links. It retains the Cookie identity so an imported profile can synchronize against the receiving user's local Cookie.

Other user-configured values remain in exports. Share links compress and encode the export but do not encrypt it. Review headers, comments, and URLs before exporting or sharing a profile.
