# Documentation E2E coverage

The suite runs the production MV3 bundle in Chromium. Vitest owns suite lifecycle and assertions; Playwright drives extension pages, tabs, cookies, and real DNR requests.

## Run the suite

From the repository root, install the browser once, then run the suite:

```sh
pnpm --filter=extension exec playwright install --with-deps chromium
pnpm run test:e2e
```

`test:e2e` builds the production extension before running tests in `--headless=new` mode. To run one file against a fresh production build:

```sh
pnpm run build
pnpm --filter=extension exec vitest run --config vitest.e2e.config.ts e2e/profiles/recovery.e2e.test.ts
```

Each test gets a fresh browser profile. Only the loopback HTTP server is shared within a file. Browser restarts within a test preserve that test's storage. Setup waits for DNR rules, registration records, and badge updates; live edits must wait for the changed rule or observable request behavior, since storage updates finish before DNR updates.

## Coverage

| Documentation area | Specification |
| --- | --- |
| Request/response header operations, trimming, disabled/empty items, append restrictions, priority conflicts | `actions/modify-headers.e2e.test.ts` |
| Redirect, Block, Allow versus Allow All Requests, subframes, higher-priority child blocks, Upgrade Scheme | `actions/control-actions.e2e.test.ts` |
| Cookie identity, host-only/domain representation, paths, updates, deletion, duplicate identities, target scope | `actions/sync-cookies.e2e.test.ts` |
| Overlapping domain includes/exclusions, URL Filter, Regex precedence and fallback, case sensitivity, self-exclusion | `conditions/domain-and-url.e2e.test.ts` |
| Initiator Domains, Top-level Domains, Domain Type, methods, resource types, condition AND behavior | `conditions/request-context.e2e.test.ts` |
| Tab IDs, Tab Groups, include union, overlapping-tab registration errors and recovery, live membership, partial/final close and restart cleanup | `conditions/tab-scope.e2e.test.ts` |
| Rule lifecycle, badge, pause/resume shortcuts, live updates, global power, reinitialize, errors, priorities | `profiles/lifecycle.e2e.test.ts` |
| Invalid edits, empty actions, dynamic/session scope transitions, edits while powered off, metadata-only changes, restart persistence | `profiles/recovery.e2e.test.ts` |
| Profile operations, action/condition item modes, Profile Groups, context menus, undo/redo, multiple popups and reopening | `profiles/editor-and-groups.e2e.test.ts` |
| JSON/file/share import, real imported requests, cancellation, corrupt links, non-mutating export redaction, fresh IDs and download | `portability/import-export.e2e.test.ts` |

## Diagnose failures

Failed tests save Playwright traces to `extension/test-results/<test-id>/trace.zip`. CI uploads this directory as `e2e-failure-traces` on failure. Open a downloaded or local trace with:

```sh
pnpm --filter=extension exec playwright show-trace test-results/<test-id>/trace.zip
```

Traces contain browser actions, snapshots, console output, and network activity. Tests use synthetic profiles and cookies. Cleanup closes the browser and removes its temporary profile even if an assertion fails.

## Browser boundaries

The optional `cookies` and `tabGroups` permissions are promoted only in a temporary copy of the production manifest because Chromium's browser-owned permission bubble cannot be controlled in headless mode. The checked-in production manifest is not modified.

Permission prompts and denial are not covered. Clipboard tests intercept `writeText` to check the copied payload; they do not verify the operating-system clipboard. Upgrade Scheme and the public share page use routed responses; request/header, cookie, and condition tests use the local HTTP server.
