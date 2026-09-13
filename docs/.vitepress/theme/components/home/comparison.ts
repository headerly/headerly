type Status = "yes" | "no" | "limited" | "unknown";
interface Support {
  status: Status;
  note?: string;
}
interface Feature {
  name: string;
  detail?: string;
  support: [Support, Support, Support, Support, Support];
}

export const tools = [
  { name: "Headerly", source: "/explanation/compare-tools#what-headerly-emphasizes" },
  { name: "Requestly", source: "/explanation/compare-tools#headerly-and-requestly" },
  { name: "ModHeader", source: "/explanation/compare-tools#headerly-and-modheader" },
  { name: "Header Editor", source: "/explanation/compare-tools#headerly-and-header-editor" },
  { name: "tweak", source: "/explanation/compare-tools#headerly-and-tweak" },
];

export const statuses = {
  yes: { label: "Yes", icon: "i-lucide-check", description: "Supported" },
  no: { label: "No", icon: "i-lucide-x", description: "Not supported in this tool" },
  limited: { label: "Limited", icon: "i-lucide-circle-minus", description: "See the qualification in the cell" },
  unknown: { label: "Unverified", icon: "i-lucide-circle-help", description: "Not confirmed in the reviewed official documentation" },
} satisfies Record<Status, { label: string; icon: string; description: string }>;

const yes: Support = { status: "yes" };
const no: Support = { status: "no" };
const unknown: Support = { status: "unknown" };

export const features: Feature[] = [
  { name: "Request header editing", support: [yes, yes, yes, yes, yes] },
  { name: "Response header editing", support: [yes, yes, yes, yes, yes] },
  { name: "Request redirects", support: [yes, yes, yes, yes, yes] },
  { name: "URL-based targeting", support: [yes, yes, yes, yes, yes] },
  { name: "Import / export rules", support: [yes, yes, yes, yes, yes] },
  {
    name: "Edit rules in the popup",
    detail: "Full editing, not just enable / disable",
    support: [yes, { status: "no", note: "Web app editor" }, yes, { status: "limited", note: "Management panel" }, yes],
  },
  {
    name: "Radio / checkbox profile groups",
    detail: "Choose one profile or combine several",
    support: [yes, unknown, unknown, unknown, unknown],
  },
  {
    name: "Live cookie synchronization",
    detail: "Follow a selected browser cookie’s value",
    support: [{ status: "yes", note: "Optional permission" }, unknown, unknown, unknown, unknown],
  },
  {
    name: "Browser tab-group targeting",
    detail: "Follow changes to group membership",
    support: [{ status: "yes", note: "Current session" }, unknown, unknown, unknown, unknown],
  },
  {
    name: "Response body modification",
    support: [no, yes, { status: "no", note: "ModResponse is separate" }, yes, yes],
  },
  {
    name: "Simulated response delays",
    support: [no, yes, { status: "no", note: "ModResponse is separate" }, unknown, yes],
  },
  {
    name: "Firefox distribution",
    support: [no, yes, yes, yes, yes],
  },
];
