import type { AddRuleOptionDialogTab } from "./shared";
import type { GroupType, HeaderModGroup } from "@/lib/schema";
import type { ActionType } from "@/lib/types";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";
import { findHeaderModGroups } from "#/pages/profiles/utils";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { ensureCookiesPermission } from "@/lib/permissions";
import { createHeaderMod, createRedirectUrl, createSyncCookie } from "@/lib/profileFactory";
import { getEnabledState, withDisabledState } from "./shared";

export function useCreateActionTab(): AddRuleOptionDialogTab {
  const { t } = useI18n();
  const profilesStore = useProfilesStore();

  function addHeaderActionGroup(type: ActionType, groupType: GroupType) {
    const profile = profilesStore.selectedProfile;
    if (type === "request") {
      profile.requestHeaderModGroups ??= [];
    } else {
      profile.responseHeaderModGroups ??= [];
    }
    const groups = findHeaderModGroups(profile, type)!;
    const group = {
      id: uuidv7(),
      type: groupType,
      items: [createHeaderMod()],
    } as const satisfies HeaderModGroup;
    groups.push(group);
  }

  function addSyncCookieGroup() {
    const profile = profilesStore.selectedProfile;
    profile.syncCookieGroups ??= [];
    profile.syncCookieGroups.push({
      id: uuidv7(),
      type: "checkbox",
      items: [createSyncCookie()],
    });
  }

  function addRedirectUrlGroup() {
    const profile = profilesStore.selectedProfile;
    if (!profile.redirectUrlGroup?.length) {
      profile.redirectUrlGroup = [createRedirectUrl()];
    }
  }

  function getModifyHeadersRuleActionDisabledState() {
    if (profilesStore.selectedProfile.ruleActionType === "modifyHeaders") {
      return getEnabledState();
    }

    return {
      disabled: true,
      disabledTooltip: t("addRuleOptionDialog.disabledTooltip.modifyHeadersRuleActionType"),
    };
  }

  function getRedirectUrlDisabledState() {
    if (profilesStore.selectedProfile.ruleActionType !== "redirect") {
      return {
        disabled: true,
        disabledTooltip: t("addRuleOptionDialog.disabledTooltip.redirectRuleActionType"),
      };
    }

    if (profilesStore.selectedProfile.redirectUrlGroup?.length) {
      return {
        disabled: true,
        disabledTooltip: t("addRuleOptionDialog.disabledTooltip.redirectUrlExists"),
      };
    }

    return getEnabledState();
  }

  return {
    label: t("addRuleOptionDialog.tabs.actions"),
    value: "actions",
    items: [
      withDisabledState({
        key: "modify-request-header",
        title: t("addRuleOptionDialog.items.modifyRequestHeader.title"),
        description: t("addRuleOptionDialog.items.modifyRequestHeader.description"),
        action: () => addHeaderActionGroup("request", "checkbox"),
      }, getModifyHeadersRuleActionDisabledState),
      withDisabledState({
        key: "modify-response-header",
        title: t("addRuleOptionDialog.items.modifyResponseHeader.title"),
        description: t("addRuleOptionDialog.items.modifyResponseHeader.description"),
        action: () => addHeaderActionGroup("response", "checkbox"),
      }, getModifyHeadersRuleActionDisabledState),
      withDisabledState({
        key: "cookie-sync-request-header",
        title: t("addRuleOptionDialog.items.cookieSyncRequestHeader.title"),
        description: t("addRuleOptionDialog.items.cookieSyncRequestHeader.description"),
        action: async () => {
          if (await ensureCookiesPermission()) {
            addSyncCookieGroup();
          }
        },
      }, getModifyHeadersRuleActionDisabledState),
      withDisabledState({
        key: "simple-redirect-url",
        title: t("addRuleOptionDialog.items.simpleRedirectUrl.title"),
        description: t("addRuleOptionDialog.items.simpleRedirectUrl.description"),
        action: addRedirectUrlGroup,
      }, getRedirectUrlDisabledState),
    ],
  };
}
