import { defineConfig } from "vitepress";

export default defineConfig({
  cleanUrls: true,
  title: "Headerly",
  description: "Configure browser network rules with reusable profiles.",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
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
    ],
    sidebar: [
      {
        text: "Start",
        items: [
          { text: "Overview", link: "/start/overview" },
          { text: "Install Headerly", link: "/start/installation" },
          { text: "Create your first profile", link: "/start/first-profile" },
        ],
      },
      {
        text: "Guides",
        collapsed: false,
        items: [
          { text: "Modify request headers", link: "/guides/modify-request-headers" },
          { text: "Modify response headers", link: "/guides/modify-response-headers" },
          { text: "Synchronize cookies", link: "/guides/sync-cookies" },
          { text: "Redirect requests", link: "/guides/redirect-requests" },
          { text: "Block or allow requests", link: "/guides/block-or-allow-requests" },
          { text: "Scope rules to tabs", link: "/guides/scope-rules-to-tabs" },
          { text: "Import, export, and share", link: "/guides/import-export-share" },
        ],
      },
      {
        text: "Core reference",
        collapsed: false,
        items: [
          { text: "Profiles", link: "/reference/profiles" },
          { text: "Profile groups", link: "/reference/profile-groups" },
          { text: "Priorities", link: "/reference/priorities" },
          { text: "Radio and checkbox groups", link: "/reference/group-modes" },
        ],
      },
      {
        text: "Actions",
        collapsed: false,
        items: [
          { text: "Action overview", link: "/reference/actions/" },
          { text: "Modify headers", link: "/reference/actions/modify-headers" },
          { text: "Synchronize cookies", link: "/reference/actions/sync-cookies" },
          { text: "Redirect", link: "/reference/actions/redirect" },
          { text: "Block", link: "/reference/actions/block" },
          { text: "Allow", link: "/reference/actions/allow" },
          { text: "Upgrade scheme", link: "/reference/actions/upgrade-scheme" },
          { text: "Allow all requests", link: "/reference/actions/allow-all-requests" },
        ],
      },
      {
        text: "Conditions",
        collapsed: false,
        items: [
          { text: "Condition overview", link: "/reference/conditions/" },
          { text: "URL filter", link: "/reference/conditions/url-filter" },
          { text: "Regular expression filter", link: "/reference/conditions/regex-filter" },
          { text: "URL case sensitivity", link: "/reference/conditions/url-case-sensitivity" },
          { text: "Request domains", link: "/reference/conditions/request-domains" },
          { text: "Initiator domains", link: "/reference/conditions/initiator-domains" },
          { text: "Top-level domains", link: "/reference/conditions/top-level-domains" },
          { text: "Domain type", link: "/reference/conditions/domain-type" },
          { text: "Resource types", link: "/reference/conditions/resource-types" },
          { text: "Request methods", link: "/reference/conditions/request-methods" },
          { text: "Tab IDs", link: "/reference/conditions/tab-ids" },
          { text: "Tab groups", link: "/reference/conditions/tab-groups" },
        ],
      },
      {
        text: "Other reference",
        collapsed: true,
        items: [
          { text: "Import and export format", link: "/reference/import-export-format" },
          { text: "Settings", link: "/reference/settings" },
          { text: "Permissions", link: "/reference/permissions" },
          { text: "Compatibility and limits", link: "/reference/compatibility-and-limits" },
        ],
      },
      {
        text: "How it works",
        collapsed: true,
        items: [
          { text: "Declarative Net Request", link: "/explanation/declarative-net-request" },
          { text: "Matching and rule scope", link: "/explanation/matching-and-rule-scope" },
          { text: "Priority and conflicts", link: "/explanation/priority-and-conflicts" },
          { text: "Privacy model", link: "/explanation/privacy-model" },
        ],
      },
      {
        text: "Troubleshooting",
        collapsed: false,
        items: [
          { text: "Rule not applied", link: "/troubleshooting/rule-not-applied" },
          { text: "Unexpected matches", link: "/troubleshooting/unexpected-matches" },
          { text: "Registration errors", link: "/troubleshooting/registration-errors" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/headerly/headerly" },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
  },
});
