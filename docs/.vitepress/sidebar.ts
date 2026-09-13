import type { DefaultTheme } from "vitepress";
import { relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { generateSidebar } from "vitepress-sidebar";

const groups = [
  { text: "Start", directory: "start" },
  { text: "Guides", directory: "guides", collapsed: false },
  { text: "Core reference", directory: "reference", collapsed: false, exclude: ["actions", "conditions"] },
  { text: "Actions", directory: "reference/actions", collapsed: false },
  { text: "Conditions", directory: "reference/conditions", collapsed: false },
  { text: "How it works", directory: "explanation", collapsed: true },
  { text: "Troubleshooting", directory: "troubleshooting", collapsed: false },
];

function resolveLinks(items: DefaultTheme.SidebarItem[], directory: string): DefaultTheme.SidebarItem[] {
  return items.map(item => ({
    ...item,
    ...(item.link !== undefined ? { link: `/${directory}/${item.link.replace(/(^|\/)index\.md$/, "$1")}` } : {}),
    ...(item.items ? { items: resolveLinks(item.items, directory) } : {}),
  }));
}

// Pages supply their heading, optional sidebarTitle, and order in frontmatter.
// New pages without an order appear after the explicitly ordered pages.
export function generateDocsSidebar(): DefaultTheme.SidebarItem[] {
  return groups.map(({ text, directory, collapsed, exclude }) => {
    const items = generateSidebar({
      documentRootPath: relative(process.cwd(), fileURLToPath(new URL("../", import.meta.url))) || ".",
      scanStartPath: directory,
      useTitleFromFileHeading: true,
      useTitleFromFrontmatter: true,
      frontmatterTitleFieldName: "sidebarTitle",
      sortMenusByFrontmatterOrder: true,
      frontmatterOrderDefaultValue: Number.MAX_SAFE_INTEGER,
      includeRootIndexFile: true,
      includeFolderIndexFile: true,
      excludeByGlobPattern: exclude,
    });

    if (!Array.isArray(items)) {
      throw new TypeError(`Expected a sidebar array for ${directory}`);
    }

    return { text, collapsed, items: resolveLinks(items, directory) };
  });
}
