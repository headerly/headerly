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
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ["**/*.{ts,vue}"],
    rules: {
      "antfu/no-top-level-await": "off",
      "style/brace-style": ["error", "1tbs"],
    },
  },
  {
    plugins: {
      "better-tailwindcss": tailwind,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "./src/assets/tailwind.css",
      },
    },
    rules: {
      ...tailwind.configs.recommended!.rules,
      "better-tailwindcss/no-unregistered-classes": [
        "error",
        {
          ignore: ["dropdown-content", "indicator-item"],
        },
      ],
    },
  },
  {
    ignores: ["**/*.md"],
  },
)
  .append(...vueI18n.configs["flat/recommended"], {
    settings: {
      "vue-i18n": {
        localeDir: "./src/assets/_locales/*.json",
        messageSyntaxVersion: "^9.0.0",
      },
    },
  });
