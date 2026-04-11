# Headerly

## Introduction

Headerly is a powerful and reliable browser extension designed for managing HTTP request and response headers. It aims to be a full replacement for ModHeader, allowing developers and users to quickly set, append, or remove headers and easily customize web traffic.

As an open-source project, Headerly provides a clean, user-friendly experience without injecting ads into your webpages.

## Key Features

- **DNR API Integration:** Powered by Chrome's modern Declarative Net Request (DNR) API for fast and efficient network request modifications.
- **Privacy First:** Headerly does *not* use the older `webRequest` API. This means the extension cannot read or access the actual content/body of your requests and responses, ensuring your privacy is guaranteed.
- **Intuitive UI:** A popup interface similar to ModHeader that allows for easy profile management.
- **Flexible Configuration:** Support for using radio or checkbox modes within a single profile to manage different header rules, with configurable default modes.
- **Rich Filtering:** Apply rules conditionally based on URL matching, Regex, domains, resource types, and request methods.
- **Cookie Synchronization:** Sync specific cookies across different requests (requires additional cookies permission).
- **Undo/Redo Support:** Safely edit profiles with full undo/redo capabilities to revert unwanted changes.

## Privacy Guarantee

Your privacy is our priority. For header modification, Headerly relies on the `declarativeNetRequest` API, so the browser handles those network changes internally based on predefined rules. This means Headerly cannot inspect or analyze request payloads or response bodies as part of its header modification features. For cookie synchronization, Headerly can access specific cookie values only if you explicitly grant the optional `cookies` permission.

## Contribution
Please make sure to read the [Contributing Guide](.github/CONTRIBUTING.md) before making a pull request.

This includes instructions on how to setup development environment, test extensions, and build the final product.
