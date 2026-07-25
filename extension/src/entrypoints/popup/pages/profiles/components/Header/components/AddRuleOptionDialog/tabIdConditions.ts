import type { AddRuleOptionDialogItem } from "./shared";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getCurrentTabId } from "@/lib/currentTab";
import { withDisabledState } from "./shared";
import { useConditionDisabledStates } from "./useConditionDisabledStates";

export function useCreateTabIdConditionItems() {
  const { t } = useI18n();
  const profilesStore = useProfilesStore();
  const { getConditionAlreadyAddedDisabledState } = useConditionDisabledStates();

  function withSessionRuleScopeDisabledState<T extends AddRuleOptionDialogItem>(
    item: T,
    conditionExists: () => boolean,
  ) {
    return withDisabledState(item, () => {
      if (profilesStore.selectedProfile.ruleScope !== "session") {
        return {
          disabled: true,
          disabledTooltip: t("addRuleOptionDialog.disabledTooltip.sessionRuleScope"),
        };
      }

      return getConditionAlreadyAddedDisabledState(conditionExists());
    });
  }

  return [
    withSessionRuleScopeDisabledState({
      key: "tab-ids",
      title: t("addRuleOptionDialog.items.tabIds.title"),
      description: t("addRuleOptionDialog.items.tabIds.description"),
      action: async () => {
        const currentTabId = await getCurrentTabId();
        profilesStore.selectedProfile.filters.tabIds = [{
          id: uuidv7(),
          enabled: true,
          value: currentTabId ?? browser.tabs.TAB_ID_NONE,
        }];
      },
    }, () => Boolean(profilesStore.selectedProfile.filters.tabIds)),
    withSessionRuleScopeDisabledState({
      key: "excluded-tab-ids",
      title: t("addRuleOptionDialog.items.excludedTabIds.title"),
      description: t("addRuleOptionDialog.items.excludedTabIds.description"),
      action: async () => {
        const currentTabId = await getCurrentTabId();
        profilesStore.selectedProfile.filters.excludedTabIds = [{
          id: uuidv7(),
          enabled: true,
          value: currentTabId ?? browser.tabs.TAB_ID_NONE,
        }];
      },
    }, () => Boolean(profilesStore.selectedProfile.filters.excludedTabIds)),
  ];
}
