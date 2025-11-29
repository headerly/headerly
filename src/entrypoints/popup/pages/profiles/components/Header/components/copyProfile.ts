import type { Profile } from "@/lib/type";
import { toast } from "vue-sonner";

export async function copyProfileId(profile: Profile) {
  await navigator.clipboard.writeText(profile.id);
  toast.success("Profile ID copied to clipboard.");
}

export async function copyProfile(profile: Profile) {
  const cleanedProfile = {
    ...profile,
    // Contains private information; export prohibited.
    syncCookieGroups: undefined,
    filters: {
      ...profile.filters,
      // It cannot maintain consistency across devices,
      // so there's no point in exporting it.
      tabIds: undefined,
    },
  };

  const profileString = JSON.stringify(cleanedProfile, null, 2);
  // Manually deleting UUIDs from each Profile is too tedious,
  // so here we'll use regular expressions to delete all lines containing "id".
  const profileStringWithoutUUID = profileString.replace(/^\s*"id": ".*?",?\n/gm, "");
  await navigator.clipboard.writeText(profileStringWithoutUUID);
  toast.success("Current profile copied to clipboard.");
}
