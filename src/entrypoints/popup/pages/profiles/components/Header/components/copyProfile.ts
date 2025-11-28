import type { Profile } from "@/lib/type";
import { toast } from "vue-sonner";

export async function copyProfileId(profile: Profile) {
  await navigator.clipboard.writeText(profile.id);
  toast.success("Profile ID copied to clipboard.");
}

// TODO: Tab filters offer no benefit for sharing.
// After implementing a tab filter, you need to manually delete
// the relevant fields to prevent them from appearing in the clipboard.
export async function copyProfile(profile: Profile) {
  const profileString = JSON.stringify(profile, null, 2);
  // Manually deleting UUIDs from each Profile is too tedious,
  // so here we'll use regular expressions to delete all lines containing "id".
  const profileStringWithoutUUID = profileString.replace(/^\s*"id": ".*?",?\n/gm, "");
  await navigator.clipboard.writeText(profileStringWithoutUUID);
  toast.success("Current profile copied to clipboard.");
}
