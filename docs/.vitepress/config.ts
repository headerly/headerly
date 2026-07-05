import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  cleanUrls: true,
  title: "Headerly",
  description: "Manage and customize HTTP request & response headers with ease. Quickly set, append, or remove headers.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/guide/what-is-headerly" },
    ],

    sidebar: [
      {
        text: "Guides",
        items: [
          { text: "What is Headerly", link: "/guide/what-is-headerly" },
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "How to use the Sync Cookies feature", link: "/guide/sync-cookies-feature" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/headerly/headerly" },
    ],
  },
});
