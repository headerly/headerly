# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Development Commands

Run from repository root:

- `pnpm run dev` - Start development mode (loads `.output/chrome-mv3` in `chrome://extensions/`)
- `pnpm run build` - Build for production
- `pnpm run zip` - Create distribution zip for extension stores
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Run ESLint with auto-fix
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run test` - Run unit tests

**Important:** After each code modification, agents should run `pnpm run lint:fix` and `pnpm run typecheck` to check for potential errors and fix them.

## Architecture

Headerly is a Chrome extension built with WXT framework that manages HTTP request/response headers using the Declarative Net Request (DNR) API.

### Core Components

**Background Service Worker** (`extension/src/entrypoints/background/`)
- Manages DNR rules through `registerRule.ts` and related DNR utilities
- Watches storage changes to automatically update rules when profiles change
- Uses Mutex to serialize DNR operations and prevent conflicts
- Handles rule lifecycle: creation, modification, deletion based on profile changes
- Updates extension badge with active rule count

**Popup UI** (`extension/src/entrypoints/popup/`)
- Vue 3 SPA with Vue Router for multi-page interface
- Pinia stores (`useProfilesStore`, `useSettingsStore`) manage state
- Uses the storage wrappers in `extension/src/lib/storage.ts` for reactive persistence
- Supports profile management, header modification, and filtering configuration

**Pages**
- `profiles/` - Main interface for managing and editing header modification profiles
- `settings/` - Extension-wide configuration and DNR rule troubleshooting/reinitialization
- `export/` - JSON-based profile export with preview, clipboard copy, and file download
- `import/` - Versioned JSON profile import and shared-profile entry point

**DNR Rule Generation**
- `buildCondition.ts` - Converts profile filters to DNR condition objects
- `buildAction.ts` - Converts header mod groups to DNR action objects
- `registerRule.ts` - Orchestrates rule CRUD operations with error handling

**Storage Layer** (`extension/src/lib/storage.ts`)
- Uses WXT's `storage.defineItem()` for type-safe chrome.storage access
- Debounces writes (200ms) to avoid conflicts in multi-tab scenarios
- Provides both reactive refs (for popup) and direct item access (for background)
- Stores profiles, profile groups, and selection together in the versioned `ProfileManager`

### Profile Schema

Profiles are the core data model (`extension/src/lib/schema.ts`):
- UUIDv7-based IDs for profiles, profile groups, and nested items
- Zod schemas for runtime validation
- Support for request/response header modifications
- Rich filtering: URL patterns, regex, domains, resource types, methods
- Nested action/condition groups support `radio` (one item active) and `checkbox` (multiple items active)
- `Profile.groupId` optionally links a profile to a top-level `ProfileGroup`; profiles remain stored in the canonical flat profile array
- Import/export via `stripProfileIds()` / `addProfileIds()` for ID management

### Profile Groups

- `radio` groups permit one enabled profile; `checkbox` groups permit multiple. Pause/resume state is stored in `lastEnabledProfileIds`
- Group and profile state share the same undo/redo snapshot; storage migration version 2 initializes `profileGroups`
- Profile import/export omits groups and membership, and group-only metadata changes must not trigger DNR updates

### Message Protocol

Type-safe messaging between extension contexts and the background (`extension/src/entrypoints/background/message.ts`).

Registration errors and profile-to-rule ID mappings are synchronized through storage records rather than messages.

### Key Patterns

**Internationalization**
- Popup UI internationalization uses `vue-i18n` v12.
- Do not build i18n keys dynamically. Avoid key concatenation such as ``t(`headerMod.operation.${operation}`)``.
- Do not store i18n keys in intermediate fields or variables such as `labelKey`, `titleKey`, or `descriptionKey`.
- Any localized UI string should be produced directly with `t("literal.key.path")`.
- Do not pass `t` through function parameters. When shared localized data is needed, wrap it in a `useXXX()` composable and call `useI18n()` inside that composable to get `t`.
- When a localized string needs HTML or component-rich interpolation, use the `I18nT` component instead of splitting the sentence into multiple `t()` calls.

**Storage Synchronization**
- Background watches storage via `item.watch()` for reactive updates
- Popup uses `@vueuse/core`'s `useStorageAsync()` through the wrappers in `storage.ts`
- Manual sync via `item.watch()` in storage layer ensures multi-tab consistency

**Rule Update Flow**
1. `ProfileManager` storage changes trigger the background watcher, which extracts only the old and new profile arrays
2. `diffProfiles()` computes changes (created/modified/deleted) from those profile arrays
3. Mutex-serialized `updateRules()` applies changes
4. Error and profile-to-rule status records are updated in shared storage
5. Badge count updated

**Error Handling**
- Registration errors stored in `profileId2ErrorMessageRecord`
- Rule removal failsafe to prevent dangling rules
- User-visible error messages in popup UI

### Technology Stack

- **Framework:** WXT (Chrome extension framework)
- **UI:** Vue 3 with Composition API, Pinia, Vue Router
- **Animations:** `@formkit/auto-animate`, `motion-v`
- **Components**: Shadcn Vue(Reka UI)
- **Styling:** Tailwind CSS 4.x with `cn` utility for class management
- **Validation:** Zod for schema validation and type inference
- **Storage:** Chrome Storage API with VueUse reactive integration
- **Testing:** Vitest (unit), Playwright (E2E)
- **Build:** Vite, TypeScript 6.x
- **Linting:** ESLint with `@antfu/eslint-config`
- **Utils:** TS Pattern, ES Toolkit, VueUse, Type Fest
- **Icons:** @egoist/tailwindcss-icons with lucide, use `<i class="i-lucide-..." />` syntax

### Path Aliases

- `#` → `extension/src/entrypoints/popup`
- `##` → `extension/src/entrypoints`
- `@` → `extension/src`
- `@@` → `extension`

### Important Constraints

- **Node version:** Must use >=24.15.0 (see `package.json` engines field)
- **Storage writes:** Debounced to avoid conflicts - never write in tight loops
- **Service worker:** `storage.watch` must be registered synchronously at top level
- **E2E testing:** Always use production builds and `headless=new` mode

### File Structure Notes

- `extension/src/lib/schema.ts` - All Zod schemas and type definitions
- `extension/src/lib/storage.ts` - Storage abstractions and initialization
- `extension/src/entrypoints/background/DNR/` - DNR rule management
- `extension/src/entrypoints/popup/stores/` - Pinia stores
- `extension/src/entrypoints/popup/pages/` - Vue Router pages

### Code Review Tips

- Popup pages must use `target="_blank"` for external links.
- Service Worker listeners, including `storage.watch`, must be registered at the top level or messages may be missed on startup.
