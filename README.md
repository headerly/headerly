# Headerly

## Introduction

Headerly is a browser extension for managing HTTP request headers. It aims to be a full replacement for ModHeader and is open source and reliable — it won’t sneak ads into your pages.

## Plan

### Phase 1 (v1.0.0)

-  A popup interface similar to ModHeader
-  Support for using radio or checkbox modes within a single profile, with configurable default mode
-  Support for splitting a single profile into sub-profiles, each with its own filter settings
-  Undo support when editing profiles
-  Share profiles via URL query, with a companion standalone webpage for sharing (since `chrome-extension://` cannot be used on the internet)
-  Optional cookie sync feature (requires additional cookies permission request)
-  Supports real-time log pages in Options, facilitating debugging
-  Supports Google Analytics for usage statistics
-  Supports Sentry for error tracking
