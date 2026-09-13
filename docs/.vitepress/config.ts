import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vueDevTools from "vite-plugin-vue-devtools";
import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import extensionPackage from "../../extension/package.json" with { type: "json" };
import { generateDocsSidebar } from "./sidebar";

export default defineConfig({
  cleanUrls: true,
  title: "Headerly",
  description: "Configure browser network rules with reusable profiles.",
  sitemap: {
    hostname: "https://headerly.dev",
  },
  vite: {
    resolve: {
      alias: [
        {
          // Replace the switch in desktop, overflow and mobile navigation together.
          find: /^.*\/VPSwitchAppearance\.vue$/,
          replacement: fileURLToPath(new URL("./theme/components/ThemeToggle.vue", import.meta.url)),
        },
      ],
    },
    plugins: [llmstxt(), tailwindcss(), vueDevTools()],
    ssr: { noExternal: ["@headerly/ui"] },
  },
  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  ],
  themeConfig: {
    editLink: {
      pattern: "https://github.com/headerly/headerly/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    nav: [
      { text: "Guide", link: "/start/overview" },
      { text: "Reference", link: "/reference/profiles" },
      { text: "Troubleshooting", link: "/troubleshooting/rule-not-applied" },
      {
        text: `v${extensionPackage.version}`,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/headerly/headerly/blob/main/extension/CHANGELOG.md",
          },
          {
            text: "Contributing",
            link: "https://github.com/headerly/headerly/blob/main/.github/CONTRIBUTING.md",
          },
        ],
      },
    ],
    sidebar: generateDocsSidebar(),
    socialLinks: [
      { icon: "github", link: "https://github.com/headerly/headerly" },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
  },
});
