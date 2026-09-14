import antfu from "@antfu/eslint-config";
import vueI18n from "@intlify/eslint-plugin-vue-i18n";
import tailwind from "eslint-plugin-better-tailwindcss";
import playwright from "eslint-plugin-playwright";

export default antfu(
  {
    stylistic: {
      quotes: "double",
      semi: true,
    },
    // Automatic detection does not work in a monorepo and must be enabled manually.
    markdown: true,
    vue: true,
  },
  ...vueI18n.configs.recommended,
  {
    ...playwright.configs["flat/recommended"],
    files: ["extension/e2e/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // Vitest owns parameterized tests, hooks, and assertions in this suite.
      "playwright/no-standalone-expect": "off",
      "playwright/no-duplicate-hooks": "off",
      "playwright/prefer-web-first-assertions": "off",
      "test/no-duplicate-hooks": "error",
    },
    settings: {
      playwright: {
        globalAliases: { test: ["it"] },
      },
    },
  },
  {
    files: ["extension/e2e/**/*.e2e.test.ts"],
    rules: {
      "test/no-standalone-expect": "error",
    },
  },
  {
    settings: {
      "vue-i18n": {
        localeDir: "./extension/src/locales/*.json",
        messageSyntaxVersion: "^12.0.0",
      },
    },
  },
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ["**/*.{ts,vue}"],
    rules: {
      "max-lines": ["error", 300],
      "no-nested-ternary": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "SwitchStatement",
          message: "Use ts-pattern match instead.",
        },
      ],
      "no-unneeded-ternary": "error",
      "style/brace-style": ["error", "1tbs"],
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      "vue/brace-style": ["error", "1tbs"],
      "vue/v-for-delimiter-style": ["error", "in"],
      "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
      "vue/no-duplicate-class-names": "error",
      "vue/prefer-use-template-ref": "error",
      "vue/no-import-compiler-macros": "error",
      "vue/no-restricted-syntax": [
        "error",
        {
          selector: "ConditionalExpression ConditionalExpression",
          message: "Do not nest ternary expressions.",
        },
      ],
      "vue/no-v-html": "error",
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineOptions", "defineModel", "defineProps", "defineEmits", "defineSlots"],
          defineExposeLast: true,
        },
      ],
    },
  },
  {
    plugins: {
      "better-tailwindcss": tailwind,
    },
    settings: {
      "better-tailwindcss": {
        detectComponentClasses: true,
        cwd: "./extension",
        entryPoint: "./src/entrypoints/popup/index.css",
      },
    },
    rules: {
      ...tailwind.configs.recommended.rules,
      "better-tailwindcss/no-unknown-classes": [
        "error",
        {
          ignore: [
            "i-lucide-*",
            "toaster",
          ],
        },
      ],
    },
  },
  {
    files: ["docs/**/*.{ts,vue}"],
    settings: {
      "better-tailwindcss": {
        detectComponentClasses: true,
        cwd: "./docs",
        entryPoint: "./.vitepress/theme/style.css",
      },
    },
    rules: {
      "@intlify/vue-i18n/no-raw-text": "off",
      "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["vp-raw", "no-zoom", "i-lucide-*"] }],
    },
  },
  {
    files: ["packages/ui/src/components/border-beam/BorderBeam.vue", "packages/ui/src/components/rainbow-button/RainbowButton.vue"],
    rules: {
      // These animation classes use Vue-scoped CSS with reactive custom properties.
      "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^border-beam$", "^rainbow-button$"] }],
    },
  },
  {
    files: ["pnpm-workspace.yaml"],
    rules: {
      "yaml/sort-keys": "off",
    },
  },
  {
    ignores: ["**/*.css"],
  },
);
