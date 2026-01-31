import type { Profile } from "@/lib/type";
import { toast } from "vue-sonner";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

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
  toast.success("Profile copied to clipboard.");
}

export type ActionKey = "toggle" | "delete" | "duplicate" | "comments" | "rulePriority" | "copyJson" | "copyId" | "moveUp" | "moveDown";

export interface ProfileActionItem {
  id: ActionKey;
  label: (profile: Profile) => string;
  icon?: (profile: Profile) => string;
  onClick: (profile: Profile, options?: { openComments?: () => void; openPriority?: () => void }) => void;
  disabled?: (profile: Profile) => boolean;
  variant?: "default" | "destructive";
}

export function useProfileActions() {
  const profilesStore = useProfilesStore();

  const actions = [
    {
      id: "toggle",
      label: p => (p.enabled ? "Pause" : "Resume"),
      icon: p => (p.enabled ? "i-lucide-pause" : "i-lucide-play"),
      onClick: p => profilesStore.toggleProfileEnabled(p.id),
    },
    {
      id: "duplicate",
      label: () => "Duplicate",
      icon: () => "i-lucide-copy",
      onClick: p => profilesStore.duplicateProfile(p.id),
    },
    {
      id: "delete",
      label: () => (profilesStore.manager.profiles.length === 1 ? "Reset" : "Delete"),
      icon: () => (profilesStore.manager.profiles.length === 1 ? "i-lucide-refresh-ccw" : "i-lucide-trash"),
      onClick: p => profilesStore.deleteProfile(p.id),
      variant: "destructive",
    },
    {
      id: "comments",
      label: p => (p.comments.length > 0 ? "Edit comments" : "Add comments"),
      onClick: (_, opts) => opts?.openComments?.(),
    },
    {
      id: "rulePriority",
      label: p => `Priority: ${p.priority ?? 1}`,
      icon: () => "i-lucide-arrow-up-z-a",
      onClick: (_, opts) => opts?.openPriority?.(),
    },
    {
      id: "copyJson",
      label: () => "Copy to JSON",
      onClick: p => copyProfile(p),
    },
    {
      id: "copyId",
      label: () => "Copy ID",
      onClick: p => copyProfileId(p),
    },
    {
      id: "moveUp",
      label: () => "Move up",
      onClick: p => profilesStore.moveProfileUp(p.id),
      disabled: p => !profilesStore.canMoveProfileUp(p.id),
    },
    {
      id: "moveDown",
      label: () => "Move down",
      onClick: p => profilesStore.moveProfileDown(p.id),
      disabled: p => !profilesStore.canMoveProfileDown(p.id),
    },
  ] satisfies ProfileActionItem[];

  return actions;
};

export function transformIdsToActions(actionIds: (ActionKey[] | "separator")[]) {
  const actions = useProfileActions();
  const id2ActionMap = new Map(actions.map(a => [a.id, a]));

  const actionGroups = actionIds.map(group =>
    group === "separator" ? "separator" : group.map(id => id2ActionMap.get(id)!),
  );

  return actionGroups;
}
