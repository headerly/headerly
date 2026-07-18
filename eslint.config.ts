import antfu from "@antfu/eslint-config";
import vueI18n from "@intlify/eslint-plugin-vue-i18n";
import tailwind from "eslint-plugin-better-tailwindcss";

export default antfu(
  {
    stylistic: {
      quotes: "double",
      semi: true,
    },
    // Automatic detection does not work in a monorepo and must be enabled manually.
    vue: true,
  },
  ...vueI18n.configs.recommended,
  {
    settings: {
      "vue-i18n": {
        localeDir: "./extension/src/locales/*.json",
        messageSyntaxVersion: "^12.0.0",
      },
    },
  },
  {
    files: ["**/*.{ts,vue}"],
    rules: {
      "max-lines": ["error", 300],
    },
  },
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ["**/*.{ts,vue}"],
    rules: {
      "antfu/no-top-level-await": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "SwitchStatement",
          message: "Use ts-pattern match instead.",
        },
        {
          selector: "ConditionalExpression",
          message: "Use ts-pattern match instead.",
        },
      ],
      "style/brace-style": ["error", "1tbs"],
      "vue/brace-style": ["error", "1tbs"],
      "vue/v-for-delimiter-style": ["error", "in"],
      "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
      "vue/no-duplicate-class-names": "error",
      "vue/prefer-use-template-ref": "error",
      "vue/no-import-compiler-macros": "error",
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
        cwd: "./extension",
        entryPoint: "./src/entrypoints/popup/index.css",
      },
    },
    rules: {
      ...tailwind.configs.recommended!.rules,
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
    files: ["pnpm-workspace.yaml"],
    rules: {
      "yaml/sort-keys": "off",
    },
  },
  {
    ignores: ["**/*.{css,md}"],
  },
);
