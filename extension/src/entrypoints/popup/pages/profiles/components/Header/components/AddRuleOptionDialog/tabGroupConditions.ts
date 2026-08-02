import type { TabGroupsFilterGroup } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getCurrentTabGroupBinding } from "@/lib/currentTab";
import { ensureBrowserPermission } from "@/lib/permissions";
import { useConditionDisabledStates } from "./useConditionDisabledStates";

function createTabGroupsFilterGroup(value: TabGroupsFilterGroup["items"][number]["value"]): TabGroupsFilterGroup {
  return { type: "radio", items: [{ id: uuidv7(), enabled: true, value }] };
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
      requiresAdditionalPermission: true,
      action: async () => {
        if (await ensureBrowserPermission("tabGroups")) {
          const currentTabGroupBinding = await getCurrentTabGroupBinding();
          profilesStore.selectedProfile.filters[filterType] = createTabGroupsFilterGroup(
            currentTabGroupBinding ? [currentTabGroupBinding] : [],
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
