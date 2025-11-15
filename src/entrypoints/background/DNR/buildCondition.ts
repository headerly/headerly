import type { ProfileCoreData } from "..";

export function buildCondition(profile: ProfileCoreData) {
  const condition: Browser.declarativeNetRequest.RuleCondition = {};

  if (profile.filters.urlFilter?.length) {
    const enabledUrlFilter = profile.filters.urlFilter.find(f => f.enabled);
    if (enabledUrlFilter && enabledUrlFilter.value.trim()) {
      condition.urlFilter = enabledUrlFilter.value.trim();
    }
  }

  if (profile.filters.regexFilter?.length) {
    const enabledRegexFilter = profile.filters.regexFilter.find(f => f.enabled);
    if (enabledRegexFilter && enabledRegexFilter.value.trim()) {
      condition.regexFilter = enabledRegexFilter.value.trim();
    }
  }

  if (profile.filters.requestDomains?.items.length) {
    const enabledDomains = profile.filters.requestDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (enabledDomains.length > 0) {
      condition.requestDomains = enabledDomains;
    }
  }

  if (profile.filters.excludedRequestDomains?.items.length) {
    const excludedDomains = profile.filters.excludedRequestDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (excludedDomains.length > 0) {
      condition.excludedRequestDomains = excludedDomains;
    }
  }

  if (profile.filters.initiatorDomains?.items.length) {
    const initiatorDomains = profile.filters.initiatorDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (initiatorDomains.length > 0) {
      condition.initiatorDomains = initiatorDomains;
    }
  }

  if (profile.filters.excludedInitiatorDomains?.items.length) {
    const excludedInitiatorDomains = profile.filters.excludedInitiatorDomains.items
      .filter(item => item.enabled && item.value.trim())
      .map(item => item.value.trim());
    if (excludedInitiatorDomains.length > 0) {
      condition.excludedInitiatorDomains = excludedInitiatorDomains;
    }
  }

  return condition;
}
