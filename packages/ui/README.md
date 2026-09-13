# Use shared UI components

Both `docs` and `extension` depend on `@headerly/ui` through `workspace:*`. Run `pnpm install` from the repository root before working on either app.

Import a component from its directory:

```vue
<script setup lang="ts">
import { Button } from "@headerly/ui/components/button";
</script>

<template>
  <Button><slot /></Button>
</template>
```

Package exports resolve to `src` files. There is no UI build step or `dist` directory. Directory imports resolve to the source `index.ts`, which re-exports the Vue component. To navigate directly from the import to the `.vue` file, use `import Button from "@headerly/ui/components/button/Button.vue"`.

In VitePress Markdown content, wrap custom UI in an element with `class="vp-raw"` to exclude VitePress article styles. See [DownloadButtons.vue](../../docs/.vitepress/theme/components/DownloadButtons.vue) for a working example.

## Change shared styles

Edit [src/styles/tailwind.css](src/styles/tailwind.css) for theme tokens, dark mode, fonts, plugins, animations and shared base styles. Both apps import this file. It explicitly scans the shared components using Tailwind's [`@source` directive](https://tailwindcss.com/docs/detecting-classes-in-source-files).

Each app's CSS entry only adds its own source locations and app-specific styles. Extension enables Preflight and overrides the small breakpoint for the popup. Docs imports shared utilities with `important` so they take precedence over VitePress's unlayered styles. Docs uses VitePress's reset and page styles, following Tailwind's [instructions for omitting Preflight](https://tailwindcss.com/docs/preflight#disabling-preflight).

## Add a component

Run the shadcn-vue CLI from `packages/ui`:

```sh
cd packages/ui
pnpm dlx shadcn-vue@latest add accordion
```

The package's `components.json` and TypeScript aliases target the shared source directories. Keep new component dependencies in this package and export new component directories through their `index.ts`. Use `@headerly/ui/lib/utils` for `cn()`.

## Supply localized labels

Shared components default to English and do not require an i18n plugin. Hosts can provide a computed `UiLabels` object using `uiLabelsKey` from `@headerly/ui/lib/labels`. The extension's [main.ts](../../extension/src/entrypoints/popup/main.ts) connects these labels to its existing translations and reacts to locale changes.

## Verify changes

Run from the repository root:

```sh
pnpm run lint:fix
pnpm run typecheck
pnpm run build
pnpm run docs:build
```
