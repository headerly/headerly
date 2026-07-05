import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Headerly",
  description: "Manage and customize HTTP request & response headers with ease. Quickly set, append, or remove headers.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },

    ],

    sidebar: [
      {
        text: "Guides",
        items: [
          { text: "How to use the Sync Cookies feature", link: "/how-to-use-the-sync-cookies-feature" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/headerly/headerly" },
    ],
  },
});
