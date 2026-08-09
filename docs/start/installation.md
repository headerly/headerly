# Install Headerly

Install Headerly from one of the supported extension stores:

- [Chrome Web Store](https://chromewebstore.google.com/detail/headerly/lmlapacaojgifapgjkbdkmaclkgcbhng)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/headerly/dhkjobinnldebfgpondcjlefklcapnha)

Headerly requires Chrome 145 or a compatible Chromium-based browser version.

After installation, pin Headerly to the browser toolbar if you want one-click access. Open the extension to display the Profiles page.

## Keyboard shortcut

Open `chrome://extensions/shortcuts`, find Headerly, and assign a shortcut to **Turn Headerly on or off**. Use it to quickly pause or resume every Headerly rule without opening the extension.

## Permissions

The core extension uses the following permissions:

| Permission | Purpose |
| --- | --- |
| `storage` | Stores profiles, settings, registration records, and errors |
| `declarativeNetRequest` | Registers browser network rules |
| Host access to `<all_urls>` | Allows rules and cookie lookup across configured sites |

Cookie synchronization and tab-group conditions request additional permissions only when used.

### `cookies`

Requested when cookie synchronization is added or imported. It allows Headerly to list selected-domain cookies, read their values, and receive change notifications. Headerly does not create or delete browser cookies through this feature.

### `tabGroups`

Requested when a Tab Groups condition is added. It allows Headerly to list groups and observe group removal. Headerly uses the Tabs API to resolve the tabs contained in each group.

Declining an optional permission cancels the operation that requires it. Existing unrelated profiles continue to work.
