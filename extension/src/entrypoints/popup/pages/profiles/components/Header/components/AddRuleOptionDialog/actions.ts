import type { AddRuleOptionDialogTab } from "./shared";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { ensureCookiesPermission } from "@/lib/utils";
import { getEnabledState, withDisabledState } from "./shared";

export function useCreateActionTab(): AddRuleOptionDialogTab {
  const { t } = useI18n();
  const profilesStore = useProfilesStore();

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
        action: () => profilesStore.addHeaderActionGroup("request", "checkbox"),
      }, getModifyHeadersRuleActionDisabledState),
      withDisabledState({
        key: "modify-response-header",
        title: t("addRuleOptionDialog.items.modifyResponseHeader.title"),
        description: t("addRuleOptionDialog.items.modifyResponseHeader.description"),
        action: () => profilesStore.addHeaderActionGroup("response", "checkbox"),
      }, getModifyHeadersRuleActionDisabledState),
      withDisabledState({
        key: "cookie-sync-request-header",
        title: t("addRuleOptionDialog.items.cookieSyncRequestHeader.title"),
        description: t("addRuleOptionDialog.items.cookieSyncRequestHeader.description"),
        action: async () => {
          if (await ensureCookiesPermission()) {
            profilesStore.addSyncCookieGroup();
          }
        },
      }, getModifyHeadersRuleActionDisabledState),
      withDisabledState({
        key: "simple-redirect-url",
        title: t("addRuleOptionDialog.items.simpleRedirectUrl.title"),
        description: t("addRuleOptionDialog.items.simpleRedirectUrl.description"),
        action: () => profilesStore.addRedirectUrlGroup(),
      }, getRedirectUrlDisabledState),
    ],
  };
}
