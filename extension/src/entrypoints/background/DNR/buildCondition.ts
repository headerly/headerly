import type { ProfileCoreData } from "..";
import { match } from "ts-pattern";

interface BuildConditionOptions {
  nativeResourceTypeBehavior: boolean;
}

export function buildCondition(profile: ProfileCoreData, options: BuildConditionOptions) {
  const condition: Browser.declarativeNetRequest.RuleCondition = {};

  const hasResourceTypes = profile.filters.resourceTypes?.some(item => item.enabled && item.value.length > 0);
  const hasExcludedResourceTypes = profile.filters.excludedResourceTypes?.some(item => item.enabled && item.value.length > 0);

  if (!hasResourceTypes && !hasExcludedResourceTypes && !options.nativeResourceTypeBehavior) {
    // If no resource types are specified, match all types.
    // Setting resource types to "undefined" is too limiting; setting it to "all" can improve extension usability.
    condition.resourceTypes = Object.values(browser.declarativeNetRequest.ResourceType);
  }

  (Object.keys(profile.filters) as (keyof typeof profile.filters)[]).forEach((key) => {
    match(key)
      .with("resourceTypes", "excludedResourceTypes", (k) => {
        const enabledItems = profile.filters[k]
          ?.filter(item => item.enabled)
          .flatMap(item => item.value);
        if (enabledItems && enabledItems.length > 0) {
          condition[k] = enabledItems;
        }
      })
      .with("requestMethods", "excludedRequestMethods", (k) => {
        const enabledItems = profile.filters[k]
          ?.filter(item => item.enabled)
          .flatMap(item => item.value);
        if (enabledItems && enabledItems.length > 0) {
          condition[k] = enabledItems;
        }
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
        (k) => {
          const enabledDomains = profile.filters[k]?.items
            .filter(item => item.enabled && item.value.trim())
            .map(item => item.value.trim());
          if (enabledDomains && enabledDomains.length > 0) {
            condition[k] = enabledDomains;
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

  // Always exclude the extension itself from its own rules to prevent lockout.
  const extensionId = browser.runtime.id;
  if (condition.excludedInitiatorDomains) {
    if (!condition.excludedInitiatorDomains.includes(extensionId)) {
      condition.excludedInitiatorDomains.push(extensionId);
    }
  } else if (!condition.initiatorDomains?.includes(extensionId)) {
    // If initiatorDomains is set and includes extensionId, we don't want to exclude it.
    // But if it's not set, we add it to excludedInitiatorDomains.
    condition.excludedInitiatorDomains = [extensionId];
  }

  return condition;
}
