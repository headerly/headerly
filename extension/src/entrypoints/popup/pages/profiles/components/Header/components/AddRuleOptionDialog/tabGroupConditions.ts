import type { TabGroupBinding, TabGroupsFilterGroup } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getCurrentTab } from "@/lib/currentTab";
import { ensureTabGroupsPermission } from "@/lib/permissions";
import { useConditionDisabledStates } from "./useConditionDisabledStates";

function createTabGroupsFilterGroup(value: TabGroupBinding[]): TabGroupsFilterGroup {
  return { type: "radio", items: [{ id: uuidv7(), enabled: true, value }] };
}

async function getCurrentTabGroupBinding(): Promise<TabGroupBinding[]> {
  const currentTab = await getCurrentTab();
  if (!currentTab || currentTab.groupId === undefined || currentTab.groupId === browser.tabGroups.TAB_GROUP_ID_NONE) {
    return [];
  }

  const tabs = await browser.tabs.query({ groupId: currentTab.groupId });
  return [{
    groupId: currentTab.groupId,
    tabIds: tabs.flatMap(tab => tab.id === undefined ? [] : [tab.id]),
  }];
}

export function useCreateTabGroupConditions() {
  const { t } = useI18n();
  const profilesStore = useProfilesStore();
  const { withConditionAlreadyAddedDisabledState } = useConditionDisabledStates();

  function createCondition(filterType: "tabGroups" | "excludedTabGroups") {
    const isExcluded = filterType === "excludedTabGroups";
    return withConditionAlreadyAddedDisabledState({
      key: isExcluded ? "excluded-tab-groups" : "tab-groups",
      title: isExcluded
        ? t("addRuleOptionDialog.items.excludedTabGroups.title")
        : t("addRuleOptionDialog.items.tabGroups.title"),
      description: isExcluded
        ? t("addRuleOptionDialog.items.excludedTabGroups.description")
        : t("addRuleOptionDialog.items.tabGroups.description"),
      ...(isExcluded ? {} : { isRecommended: true }),
      action: async () => {
        if (await ensureTabGroupsPermission()) {
          profilesStore.selectedProfile.filters[filterType] = createTabGroupsFilterGroup(
            await getCurrentTabGroupBinding(),
          );
        }
      },
    }, () => Boolean(profilesStore.selectedProfile.filters[filterType]));
  }

  return {
    tabGroupsCondition: createCondition("tabGroups"),
    excludedTabGroupsCondition: createCondition("excludedTabGroups"),
  };
}
