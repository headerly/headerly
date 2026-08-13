# Documentation E2E coverage

The suite runs the production MV3 bundle in Chromium. Vitest owns suite lifecycle and assertions; Playwright drives extension pages, tabs, cookies, and real DNR requests.

| Documentation area | Specification |
| --- | --- |
| Request/response header operations, trimming, disabled/empty items, append restrictions, priority conflicts | `actions/modify-headers.e2e.test.ts` |
| Redirect, Block, Allow, Allow All Requests, Upgrade Scheme, action precedence | `actions/control-actions.e2e.test.ts` |
| Cookie identity, host-only/domain representation, paths, updates, deletion, duplicate identities, target scope | `actions/sync-cookies.e2e.test.ts` |
| Request Domains, URL Filter, Regex Filter, Regex precedence, case sensitivity, empty conditions | `conditions/domain-and-url.e2e.test.ts` |
| Initiator Domains, Top-level Domains, Domain Type, methods, resource types, condition AND behavior | `conditions/request-context.e2e.test.ts` |
| Tab IDs, excluded tabs, Tab Groups, excluded groups, live membership, close/removal/restart cleanup | `conditions/tab-scope.e2e.test.ts` |
| Rule lifecycle, badge, pause/resume shortcuts, live updates, global power, reinitialize, errors, priorities | `profiles/lifecycle.e2e.test.ts` |
| Profile operations, action/condition item modes, Profile Groups, context menus, group modes and cleanup | `profiles/editor-and-groups.e2e.test.ts` |
| JSON/file/share import, export redaction, portable identities, new IDs, validation and download | `portability/import-export.e2e.test.ts` |

The optional `cookies` and `tabGroups` permissions are promoted only in a temporary copy of the production manifest because Chromium's browser-owned permission bubble cannot be controlled in headless mode. The checked-in production manifest is not modified.
