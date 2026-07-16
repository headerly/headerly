import type { AddRuleOptionDialogItem, AddRuleOptionDialogTab } from "./shared";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getCurrentTabHost, getCurrentTabHostname, getCurrentTabId, getDefaultFilterValueByHost } from "@/lib/utils";
import {
  getEnabledState,
  withDisabledState,
} from "./shared";

export function useCreateConditionTab(): AddRuleOptionDialogTab {
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

  function getSessionRuleScopeDisabledState() {
    if (profilesStore.selectedProfile.ruleScope === "session") {
      return getEnabledState();
    }

    return {
      disabled: true,
      disabledTooltip: t("addRuleOptionDialog.disabledTooltip.sessionRuleScope"),
    };
  }

  function withSessionRuleScopeDisabledState<T extends AddRuleOptionDialogItem>(
    item: T,
    conditionExists: () => boolean,
  ) {
    return withDisabledState(item, () => {
      const sessionScopeState = getSessionRuleScopeDisabledState();
      if (sessionScopeState.disabled) {
        return sessionScopeState;
      }
      return getConditionAlreadyAddedDisabledState(conditionExists());
    });
  }

  return {
    label: t("addRuleOptionDialog.tabs.conditions"),
    value: "conditions",
    items: [
      withConditionAlreadyAddedDisabledState({
        key: "request-domains",
        title: t("addRuleOptionDialog.items.requestDomains.title"),
        description: t("addRuleOptionDialog.items.requestDomains.description"),
        isRecommended: true,
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.requestDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: hostname,
              },
            ],
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.requestDomains?.items.length,
      )),
      withDisabledState({
        key: "url-filter",
        title: t("addRuleOptionDialog.items.urlFilter.title"),
        description: t("addRuleOptionDialog.items.urlFilter.description"),
        action: async () => {
          const host = await getCurrentTabHost();
          profilesStore.selectedProfile.filters.urlFilter = [
            {
              id: uuidv7(),
              enabled: true,
              value: getDefaultFilterValueByHost("urlFilter", host),
            },
          ];
        },
      }, getUrlFilterDisabledState),
      withDisabledState({
        key: "regex-filter",
        title: t("addRuleOptionDialog.items.regexFilter.title"),
        description: t("addRuleOptionDialog.items.regexFilter.description"),
        action: async () => {
          const host = await getCurrentTabHost();
          profilesStore.selectedProfile.filters.regexFilter = [
            {
              id: uuidv7(),
              enabled: true,
              value: getDefaultFilterValueByHost("regexFilter", host),
            },
          ];
        },
      }, getRegexFilterDisabledState),
      withConditionAlreadyAddedDisabledState({
        key: "excluded-request-domains",
        title: t("addRuleOptionDialog.items.excludedRequestDomains.title"),
        description: t("addRuleOptionDialog.items.excludedRequestDomains.description"),
        action: async () => {
          profilesStore.selectedProfile.filters.excludedRequestDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: "",
              },
            ],
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.excludedRequestDomains?.items.length,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "domain-type",
        title: t("addRuleOptionDialog.items.domainType.title"),
        description: t("addRuleOptionDialog.items.domainType.description"),
        action: () => {
          profilesStore.selectedProfile.filters.domainType = {
            enabled: true,
            value: "firstParty",
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.domainType,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "initiator-domains",
        title: t("addRuleOptionDialog.items.initiatorDomains.title"),
        description: t("addRuleOptionDialog.items.initiatorDomains.description"),
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.initiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: hostname,
              },
            ],
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.initiatorDomains?.items.length,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "excluded-initiator-domains",
        title: t("addRuleOptionDialog.items.excludedInitiatorDomains.title"),
        description: t("addRuleOptionDialog.items.excludedInitiatorDomains.description"),
        action: async () => {
          profilesStore.selectedProfile.filters.excludedInitiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: "",
              },
            ],
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.excludedInitiatorDomains?.items.length,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "top-domains",
        title: t("addRuleOptionDialog.items.topDomains.title"),
        description: t("addRuleOptionDialog.items.topDomains.description"),
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.topDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: hostname,
              },
            ],
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.topDomains?.items.length,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "excluded-top-domains",
        title: t("addRuleOptionDialog.items.excludedTopDomains.title"),
        description: t("addRuleOptionDialog.items.excludedTopDomains.description"),
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.excludedTopDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: hostname,
              },
            ],
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.excludedTopDomains?.items.length,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "request-methods",
        title: t("addRuleOptionDialog.items.requestMethods.title"),
        description: t("addRuleOptionDialog.items.requestMethods.description"),
        action: () => {
          profilesStore.selectedProfile.filters.requestMethods = [
            {
              id: uuidv7(),
              enabled: true,
              value: ["get"],
            },
          ];
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.requestMethods,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "excluded-request-methods",
        title: t("addRuleOptionDialog.items.excludedRequestMethods.title"),
        description: t("addRuleOptionDialog.items.excludedRequestMethods.description"),
        action: () => {
          profilesStore.selectedProfile.filters.excludedRequestMethods = [
            {
              id: uuidv7(),
              enabled: true,
              value: [],
            },
          ];
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.excludedRequestMethods,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "resource-types",
        title: t("addRuleOptionDialog.items.resourceTypes.title"),
        description: t("addRuleOptionDialog.items.resourceTypes.description"),
        action: () => {
          profilesStore.selectedProfile.filters.resourceTypes = [
            {
              id: uuidv7(),
              enabled: true,
              value: ["main_frame"],
            },
          ];
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.resourceTypes,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "excluded-resource-types",
        title: t("addRuleOptionDialog.items.excludedResourceTypes.title"),
        description: t("addRuleOptionDialog.items.excludedResourceTypes.description"),
        action: () => {
          profilesStore.selectedProfile.filters.excludedResourceTypes = [
            {
              id: uuidv7(),
              enabled: true,
              value: [],
            },
          ];
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.excludedResourceTypes,
      )),
      withSessionRuleScopeDisabledState({
        key: "tab-ids",
        title: t("addRuleOptionDialog.items.tabIds.title"),
        description: t("addRuleOptionDialog.items.tabIds.description"),
        action: async () => {
          const currentTabId = await getCurrentTabId();
          profilesStore.selectedProfile.filters.tabIds = [
            {
              id: uuidv7(),
              enabled: true,
              value: currentTabId ?? browser.tabs.TAB_ID_NONE,
            },
          ];
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.tabIds,
      )),
      withSessionRuleScopeDisabledState({
        key: "excluded-tab-ids",
        title: t("addRuleOptionDialog.items.excludedTabIds.title"),
        description: t("addRuleOptionDialog.items.excludedTabIds.description"),
        action: async () => {
          const currentTabId = await getCurrentTabId();
          profilesStore.selectedProfile.filters.excludedTabIds = [
            {
              id: uuidv7(),
              enabled: true,
              value: currentTabId ?? browser.tabs.TAB_ID_NONE,
            },
          ];
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.excludedTabIds,
      )),
      withConditionAlreadyAddedDisabledState({
        key: "url-regex-filter-case-sensitive",
        title: t("addRuleOptionDialog.items.urlRegexFilterCaseSensitive.title"),
        description: t("addRuleOptionDialog.items.urlRegexFilterCaseSensitive.description"),
        action: () => {
          profilesStore.selectedProfile.filters.isUrlFilterCaseSensitive = {
            enabled: true,
            value: false,
          };
        },
      }, () => Boolean(
        profilesStore.selectedProfile.filters.isUrlFilterCaseSensitive,
      )),
    ],
  };
}
