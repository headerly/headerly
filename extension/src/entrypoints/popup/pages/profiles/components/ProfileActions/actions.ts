import type { Profile } from "@/lib/schema";
import { useRouter } from "vue-router";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

export type ActionKey
  = | "toggle"
    | "delete"
    | "duplicate"
    | "comments"
    | "rulePriority"
    | "ruleActionType"
    | "copyJson";

export interface ProfileActionItem {
  id: ActionKey;
  label: (profile: Profile) => string;
  icon?: (profile: Profile) => string;
  onClick: (profile: Profile, options?: {
    openComments?: () => void;
    openPriority?: () => void;
    openChangeRuleActionType?: () => void;
  }) => void;
  disabled?: (profile: Profile) => boolean;
  variant?: "default" | "destructive";
}

export function useProfileActions() {
  const profilesStore = useProfilesStore();
  const router = useRouter();

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
      label: () => "Comments",
      onClick: (_, opts) => opts?.openComments?.(),
    },
    {
      id: "rulePriority",
      label: () => `Priority`,
      onClick: (_, opts) => opts?.openPriority?.(),
    },
    {
      id: "ruleActionType",
      label: () => {
        return "Rule action type";
      },
      onClick: (_, opts) => opts?.openChangeRuleActionType?.(),
    },
    {
      id: "copyJson",
      label: () => "Export to JSON",
      onClick: p => router.push(`/export/${p.id}`),
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
