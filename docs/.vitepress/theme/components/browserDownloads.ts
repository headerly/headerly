export type BrowserStore = "chrome" | "edge";

export interface BrowserHints {
  brands?: readonly { brand: string }[];
  mobile?: boolean;
}

export const browserStores = {
  chrome: {
    name: "Google Chrome",
    logo: "/images/browsers/chrome.svg",
    href: "https://chromewebstore.google.com/detail/headerly/lmlapacaojgifapgjkbdkmaclkgcbhng",
  },
  edge: {
    name: "Microsoft Edge",
    logo: "/images/browsers/edge.svg",
    href: "https://microsoftedge.microsoft.com/addons/detail/headerly/dhkjobinnldebfgpondcjlefklcapnha",
  },
} as const;

// Edge also includes Chrome in its user agent, so match Edge first.
export function detectBrowserStore(userAgent: string, hints?: BrowserHints): BrowserStore {
  if (hints?.brands?.some(({ brand }) => brand === "Microsoft Edge"))
    return "edge";
  if (/Edg(?:A|iOS)?\//.test(userAgent))
    return "edge";
  return "chrome";
}

export function isMobileBrowser(userAgent: string, hints?: BrowserHints): boolean {
  return hints?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
}
