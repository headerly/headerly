---
title: What is Headerly
---

# What is Headerly?

Headerly is a browser extension for managing HTTP request and response headers. It helps developers and advanced users set, append, or remove headers without changing application code or proxy configuration.

Headerly is built on the browser's Declarative Net Request API, so matching rules are applied by the browser itself. The extension manages the rules you configure, while the browser performs the network modification.

## What You Can Do

- Create profiles for different projects, environments, or debugging workflows.
- Modify request and response headers with set, append, and remove operations.
- Enable one active item in radio mode, or multiple active items in checkbox mode.
- Limit rules by URL patterns, regular expressions, domains, resource types, and request methods.
- Export and import profiles for backup, sharing, or migration.
- Sync selected browser cookies into request headers when you explicitly grant the optional cookies permission.

## When to Use Headerly

Use Headerly when you need repeatable header modifications for development, testing, debugging, or local integration work.

Common examples include adding development-only headers, testing feature flags, changing CORS-related response headers in controlled environments, and reusing selected cookie values for local API calls.

## Privacy Model

Headerly uses declarative browser rules for header modification. It does not intercept request bodies, inspect response bodies, or inject ads into webpages.
