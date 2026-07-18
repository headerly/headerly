import type { Profile, ProfileGroup } from "@/lib/schema";
import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getCurrentTabHostname } from "@/lib/currentTab";
import { createHeaderMod, createRedirectUrl } from "@/lib/profileFactory";
import { addProfileIds, stripProfileIds } from "@/lib/schema";

export type ActionKey
  = | "toggle"
    | "delete"
    | "duplicate"
    | "comments"
    | "rulePriority"
    | "ruleActionType"
    | "shareProfile";

type ProfileMenuActionKey = ActionKey | "addToGroup" | "removeFromGroup";

interface ProfileActionOptions {
  openChangeRuleActionType?: () => void;
  openComments?: () => void;
  openPriority?: () => void;
}

interface ProfileGroupActionContent {
  type: "profileGroup";
  group: ProfileGroup;
  profiles: Profile[];
}

export interface ProfileActionItem {
  type: "action";
  id: string;
  label: (profile: Profile) => string;
  icon?: (profile: Profile) => string;
  onClick: (profile: Profile, options?: ProfileActionOptions) => void;
  content?: ProfileGroupActionContent;
  disabled?: (profile: Profile) => boolean;
  inset?: boolean;
  visible?: (profile: Profile) => boolean;
  variant?: "default" | "destructive";
}

export interface ProfileActionSeparator {
  type: "separator";
  id: string;
}

export interface ProfileActionSubmenu {
  type: "submenu";
  id: string;
  label: (profile: Profile) => string;
  children: (profile: Profile) => ProfileActionSubmenuEntry[];
}

export type ProfileActionSubmenuEntry = ProfileActionItem | ProfileActionSeparator;
export type ProfileActionMenuEntry = ProfileActionItem | ProfileActionSubmenu;
export type ProfileActionGroup = readonly ProfileActionMenuEntry[] | "separator";

type ProfileActionDefinition = ProfileActionItem & { id: ActionKey };
type ProfileActionMenuDefinition = ProfileActionMenuEntry & { id: ProfileMenuActionKey };

export const profileActionIdGroups = [
  ["toggle", "duplicate"],
  "separator",
  ["addToGroup", "removeFromGroup"],
  "separator",
  ["comments", "rulePriority", "ruleActionType"],
  "separator",
  ["shareProfile"],
  "separator",
  ["delete"],
] as const satisfies readonly (readonly ProfileMenuActionKey[] | "separator")[];

function omitActionId(
  group: readonly ProfileMenuActionKey[] | "separator",
  actionId: ActionKey,
) {
  return match(group)
    .with("separator", () => group)
    .otherwise(ids => ids.filter(id => id !== actionId));
}

function hasActionIds(group: readonly ProfileMenuActionKey[] | "separator") {
  return match(group)
    .with("separator", () => true)
    .otherwise(ids => ids.length > 0);
}

export const profileMoreActionIdGroups = profileActionIdGroups
  .map(group => omitActionId(group, "toggle"))
  .filter(hasActionIds);

export async function handleProfileRuleActionTypeChanged(profile: Profile) {
  match(profile.ruleActionType)
    .with("block", "allow", "upgradeScheme", "allowAllRequests", () => {
      delete profile.requestHeaderModGroups;
      delete profile.responseHeaderModGroups;
      delete profile.syncCookieGroups;
      delete profile.redirectUrlGroup;
    })
    .with("modifyHeaders", () => {
      delete profile.redirectUrlGroup;
      profile.requestHeaderModGroups ??= [{
        id: uuidv7(),
        type: "checkbox",
        items: [createHeaderMod()],
      }];
    })
    .with("redirect", () => {
      delete profile.requestHeaderModGroups;
      delete profile.responseHeaderModGroups;
      delete profile.syncCookieGroups;
      if (!profile.redirectUrlGroup?.length) {
        profile.redirectUrlGroup = [createRedirectUrl()];
      }
    })
    .exhaustive();

  if (Object.keys(profile.filters).length > 0) {
    return;
  }

  profile.filters.requestDomains = {
    type: "checkbox",
    items: [{
      id: uuidv7(),
      enabled: true,
      value: await getCurrentTabHostname(),
    }],
  };
}

export function useProfileActions() {
  const profilesStore = useProfilesStore();
  const router = useRouter();
  const { t } = useI18n();

  function duplicateProfile(profile: Profile) {
    const targetIndex = profilesStore.manager.profiles.findIndex(candidate => candidate.id === profile.id);
    if (targetIndex === -1)
      return;

    const newProfile = addProfileIds(stripProfileIds(profile));
    newProfile.groupId = profile.groupId;
    profilesStore.manager.profiles.splice(targetIndex + 1, 0, newProfile);
    profilesStore.manager.selectedProfileId = newProfile.id;
  }

  const actions = [
    {
      type: "action",
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
      type: "action",
      id: "duplicate",
      label: () => t("common.duplicate"),
      icon: () => "i-lucide-copy",
      onClick: duplicateProfile,
    },
    {
      type: "action",
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
      type: "action",
      id: "comments",
      label: () => t("common.comments"),
      onClick: (_, opts) => opts?.openComments?.(),
    },
    {
      type: "action",
      id: "rulePriority",
      label: () => t("profile.header.priority"),
      onClick: (_, opts) => opts?.openPriority?.(),
    },
    {
      type: "action",
      id: "ruleActionType",
      label: () => {
        return t("profile.actions.ruleActionType");
      },
      onClick: (_, opts) => opts?.openChangeRuleActionType?.(),
    },
    {
      type: "action",
      id: "shareProfile",
      label: () => t("profile.actions.share"),
      onClick: p => router.push(`/export/${p.id}`),
    },
  ] satisfies ProfileActionDefinition[];

  return actions;
};

function useProfileMenuActions() {
  const profilesStore = useProfilesStore();
  const { t } = useI18n();

  function getAddToGroupActions(_profile: Profile): ProfileActionSubmenuEntry[] {
    const actions: ProfileActionSubmenuEntry[] = [{
      type: "action",
      id: "createNewGroup",
      label: () => t("profile.actions.createNewGroup"),
      inset: true,
      onClick: profile => profilesStore.addProfileToNewGroup(profile.id),
    }];

    if (profilesStore.profileGroups.length > 0) {
      actions.push({
        type: "separator",
        id: "profileGroupsSeparator",
      });
    }

    actions.push(...profilesStore.profileGroups.map((group): ProfileActionItem => ({
      type: "action",
      id: `addToGroup-${group.id}`,
      label: () => group.name,
      content: {
        type: "profileGroup",
        group,
        profiles: profilesStore.manager.profiles.filter(profile => profile.groupId === group.id),
      },
      onClick: profile => profilesStore.addProfileToGroup(profile.id, group.id),
    })));

    return actions;
  }

  const actions = [
    ...useProfileActions(),
    {
      type: "submenu",
      id: "addToGroup",
      label: () => t("profile.actions.addToGroup"),
      children: getAddToGroupActions,
    },
    {
      type: "action",
      id: "removeFromGroup",
      label: () => t("profile.actions.removeFromGroup"),
      visible: profile => profilesStore.getProfileGroup(profile.groupId) !== undefined,
      onClick: profile => profilesStore.removeProfileFromGroup(profile.id),
    },
  ] satisfies ProfileActionMenuDefinition[];

  return actions;
}

export function transformIdsToActions(
  actionIds: readonly (readonly ProfileMenuActionKey[] | "separator")[],
): ProfileActionGroup[] {
  const actions = useProfileMenuActions();
  const id2ActionMap = new Map(actions.map(a => [a.id, a]));

  const actionGroups = actionIds.map(group =>
    match(group)
      .with("separator", () => "separator" as const)
      .otherwise(ids => ids.map(id => id2ActionMap.get(id)!)),
  );

  return actionGroups;
}
