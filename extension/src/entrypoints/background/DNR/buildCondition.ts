import type { ProfileCoreData } from "../diffProfiles";
import { union, uniq } from "es-toolkit";
import { match } from "ts-pattern";

export function buildCondition(profile: ProfileCoreData) {
  const condition: Browser.declarativeNetRequest.RuleCondition = {};

  function appendTabIds(key: "tabIds" | "excludedTabIds", tabIds: number[] | undefined) {
    if (tabIds && tabIds.length > 0) {
      condition[key] = union(condition[key] ?? [], tabIds);
    }
  }

  (Object.keys(profile.filters) as (keyof typeof profile.filters)[]).forEach((key) => {
    match(key)
      .with("resourceTypes", "excludedResourceTypes", (k) => {
        const enabledItems = profile.filters[k]?.items
          .filter(item => item.enabled)
          .flatMap(item => item.value);
        if (enabledItems && enabledItems.length > 0) {
          condition[k] = uniq(enabledItems);
        }
      })
      .with("requestMethods", "excludedRequestMethods", (k) => {
        const enabledItems = profile.filters[k]?.items
          .filter(item => item.enabled)
          .flatMap(item => item.value);
        if (enabledItems && enabledItems.length > 0) {
          condition[k] = uniq(enabledItems);
        }
      })
      .with("tabIds", "excludedTabIds", (k) => {
        const enabledTabIds = profile.filters[k]?.items
          .filter(item => item.enabled)
          .flatMap(item => item.value);
        appendTabIds(k, enabledTabIds);
      })
      .with("tabGroups", "excludedTabGroups", (k) => {
        const enabledTabIds = profile.filters[k]?.items
          .filter(item => item.enabled)
          .flatMap(item => item.value)
          .flatMap(binding => binding.tabIds);
        appendTabIds(k === "tabGroups" ? "tabIds" : "excludedTabIds", enabledTabIds);
      })
      .with("urlFilter", "regexFilter", (k) => {
        // A DNR rule cannot have both urlFilter and regexFilter.
        // If both are present, regexFilter takes precedence.
        const hasEnabledRegex = profile.filters.regexFilter?.some(f => f.enabled && f.value.trim());
        if (k === "urlFilter" && hasEnabledRegex) {
          return;
        }

        const enabledFilter = profile.filters[k]?.find(f => f.enabled);
        if (enabledFilter && enabledFilter.value.trim()) {
          condition[k] = enabledFilter.value.trim();
        }
      })
      .with(
        "requestDomains",
        "excludedRequestDomains",
        "initiatorDomains",
        "excludedInitiatorDomains",
        "topDomains",
        "excludedTopDomains",
        (k) => {
          const enabledDomains = profile.filters[k]?.items
            .filter(item => item.enabled && item.value.trim())
            .map(item => item.value.trim());
          if (enabledDomains && enabledDomains.length > 0) {
            condition[k] = uniq(enabledDomains);
          }
        },
      )
      .with("domainType", (k) => {
        const value = profile.filters[k];
        if (value?.enabled) {
          condition[k] = value.value;
        }
      })
      .with("isUrlFilterCaseSensitive", (k) => {
        const value = profile.filters[k];
        if (value?.enabled) {
          condition[k] = value.value;
        }
      })
      .exhaustive();
  });

  const hasResourceTypes = condition.resourceTypes !== undefined;
  const hasExcludedResourceTypes = condition.excludedResourceTypes !== undefined;

  if (!hasResourceTypes && !hasExcludedResourceTypes && profile.ruleActionType !== "allowAllRequests") {
    // If no resource types are specified, match all types.
    // Setting resource types to "undefined" is too limiting; setting it to "all" can improve extension usability.
    const resourceTypes = Object.values(browser.declarativeNetRequest.ResourceType);
    condition.resourceTypes = resourceTypes;
  }

  // Always exclude the extension itself from its own rules to prevent lockout.
  const extensionId = browser.runtime.id;
  condition.excludedInitiatorDomains = uniq([
    ...(condition.excludedInitiatorDomains ?? []),
    extensionId,
  ]);

  return condition;
}
