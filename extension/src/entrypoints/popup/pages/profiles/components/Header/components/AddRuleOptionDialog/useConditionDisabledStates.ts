import type { AddRuleOptionDialogItem } from "./shared";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import {
  getEnabledState,
  withDisabledState,
} from "./shared";

export function useConditionDisabledStates() {
  const { t } = useI18n();
  const profilesStore = useProfilesStore();

  function getConditionAlreadyAddedDisabledState(conditionExists: boolean) {
    if (!conditionExists) {
      return getEnabledState();
    }

    return {
      disabled: true,
      disabledTooltip: t("addRuleOptionDialog.disabledTooltip.conditionAlreadyAdded"),
    };
  }

  function withConditionAlreadyAddedDisabledState<T extends AddRuleOptionDialogItem>(
    item: T,
    conditionExists: () => boolean,
  ) {
    return withDisabledState(
      item,
      () => getConditionAlreadyAddedDisabledState(conditionExists()),
    );
  }

  function getUrlFilterDisabledState() {
    if (profilesStore.selectedProfile.filters.urlFilter?.length) {
      return getConditionAlreadyAddedDisabledState(true);
    }

    if (profilesStore.selectedProfile.filters.regexFilter?.length) {
      return {
        disabled: true,
        disabledTooltip: t("addRuleOptionDialog.disabledTooltip.urlFilterBlockedByRegexFilter"),
      };
    }

    return getEnabledState();
  }

  function getRegexFilterDisabledState() {
    if (profilesStore.selectedProfile.filters.regexFilter?.length) {
      return getConditionAlreadyAddedDisabledState(true);
    }

    if (profilesStore.selectedProfile.filters.urlFilter?.length) {
      return {
        disabled: true,
        disabledTooltip: t("addRuleOptionDialog.disabledTooltip.regexFilterBlockedByUrlFilter"),
      };
    }

    return getEnabledState();
  }

  return {
    getRegexFilterDisabledState,
    getUrlFilterDisabledState,
    withConditionAlreadyAddedDisabledState,
  };
}
