import type { Profile } from "@/lib/schema";
import { match } from "ts-pattern";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

export type ActionKey
  = | "toggle"
    | "delete"
    | "duplicate"
    | "comments"
    | "rulePriority"
    | "ruleActionType"
    | "shareProfile";

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

export const profileActionIdGroups = [
  ["toggle", "duplicate"],
  "separator",
  ["comments", "rulePriority", "ruleActionType"],
  "separator",
  ["shareProfile"],
  "separator",
  ["delete"],
] as const satisfies readonly (readonly ActionKey[] | "separator")[];

function omitActionId(
  group: readonly ActionKey[] | "separator",
  actionId: ActionKey,
) {
  return match(group)
    .with("separator", () => group)
    .otherwise(ids => ids.filter(id => id !== actionId));
}

function hasActionIds(group: readonly ActionKey[] | "separator") {
  return match(group)
    .with("separator", () => true)
    .otherwise(ids => ids.length > 0);
}

export const profileMoreActionIdGroups = profileActionIdGroups
  .map(group => omitActionId(group, "toggle"))
  .filter(hasActionIds);

export function useProfileActions() {
  const profilesStore = useProfilesStore();
  const router = useRouter();
  const { t } = useI18n();

  const actions = [
    {
      id: "toggle",
      label: p => match(p.enabled)
        .with(true, () => t("profile.actions.pause"))
        .with(false, () => t("profile.actions.resume"))
        .exhaustive(),
      icon: p => match(p.enabled)
        .with(true, () => "i-lucide-pause")
        .with(false, () => "i-lucide-play")
        .exhaustive(),
      onClick: p => profilesStore.toggleProfileEnabled(p.id),
    },
    {
      id: "duplicate",
      label: () => t("common.duplicate"),
      icon: () => "i-lucide-copy",
      onClick: p => profilesStore.duplicateProfile(p.id),
    },
    {
      id: "delete",
      label: () => match(profilesStore.manager.profiles.length === 1)
        .with(true, () => t("common.reset"))
        .with(false, () => t("profile.actions.delete"))
        .exhaustive(),
      icon: () => match(profilesStore.manager.profiles.length === 1)
        .with(true, () => "i-lucide-refresh-ccw")
        .with(false, () => "i-lucide-trash")
        .exhaustive(),
      onClick: p => profilesStore.deleteProfile(p.id),
      variant: "destructive",
    },
    {
      id: "comments",
      label: () => t("common.comments"),
      onClick: (_, opts) => opts?.openComments?.(),
    },
    {
      id: "rulePriority",
      label: () => t("profile.header.priority"),
      onClick: (_, opts) => opts?.openPriority?.(),
    },
    {
      id: "ruleActionType",
      label: () => {
        return t("profile.actions.ruleActionType");
      },
      onClick: (_, opts) => opts?.openChangeRuleActionType?.(),
    },
    {
      id: "shareProfile",
      label: () => t("profile.actions.share"),
      onClick: p => router.push(`/export/${p.id}`),
    },
  ] satisfies ProfileActionItem[];

  return actions;
};

export function transformIdsToActions(actionIds: readonly (readonly ActionKey[] | "separator")[]) {
  const actions = useProfileActions();
  const id2ActionMap = new Map(actions.map(a => [a.id, a]));

  const actionGroups = actionIds.map(group =>
    match(group)
      .with("separator", () => "separator" as const)
      .otherwise(ids => ids.map(id => id2ActionMap.get(id)!)),
  );

  return actionGroups;
}
