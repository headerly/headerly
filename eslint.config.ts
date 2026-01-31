import antfu from "@antfu/eslint-config";
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
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ["**/*.{ts,vue}"],
    rules: {
      "antfu/no-top-level-await": "off",
      "style/brace-style": ["error", "1tbs"],
      "vue/brace-style": ["error", "1tbs"],
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
        entryPoint: "./extension/src/entrypoints/popup/index.css",
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
    ignores: ["**/*.md"],
  },
);
