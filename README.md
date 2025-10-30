# Headerly

## Introduction

[WIP] Still a long way from phase 1. Unavailable, this will not be released until the first phase of development is complete.

WARNING: This repository will force push arbitrarily before reaching 1.0.0

Headerly is a browser extension for managing HTTP request headers. It aims to be a full replacement for ModHeader and is open source and reliable — it won’t insert ads into your pages.

## Plan

### Phase 1 (v1.0.0)

- [x]  (UI) A popup interface similar to ModHeader
- [x]  (UI) Support for using radio or checkbox modes within a single profile, with configurable default mode
- [x]  (UI) Undo/redo support when editing profiles
- [x]  (UI) Cookie sync feature (requires additional cookies permission request)
- [ ]  (UI) Supports all types of filters in the DNR API
- [ ]  (core) Connect to DNR API
- [ ]  Share profiles via URL query, with a companion standalone webpage for sharing (since `chrome-extension://` cannot be used on the internet)
- [ ]  [Optional] Supports Google Analytics for usage statistics
- [ ]  [Optional] Supports Sentry for error tracking
