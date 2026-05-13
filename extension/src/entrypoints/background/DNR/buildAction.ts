import type { ProfileCoreData } from "..";
import { match } from "ts-pattern";

/**
 * Builds the DNR rule action from the profile. Note that it doesn't guarantee the resulting action
 * won't cause errors during registration. The issue where both arrays are empty for `modifyHeaders`
 * is already handled in `diffProfiles`.
 */
export function buildAction(profile: ProfileCoreData) {
  return match(profile.ruleActionType)
    .with("block", "allow", "upgradeScheme", "allowAllRequests", (type) => {
      return {
        type,
      } as const satisfies Browser.declarativeNetRequest.RuleAction;
    })
    .with("modifyHeaders", (type) => {
      const requestHeaders = buildRequestHeaders(profile);
      const responseHeaders = buildResponseHeaders(profile);
      return {
        type,
        requestHeaders: match(requestHeaders.length > 0)
          .with(true, () => requestHeaders)
          .with(false, () => undefined)
          .exhaustive(),
        responseHeaders: match(responseHeaders.length > 0)
          .with(true, () => responseHeaders)
          .with(false, () => undefined)
          .exhaustive(),
      } as const satisfies Browser.declarativeNetRequest.RuleAction;
    })
    .with("redirect", (type) => {
      const redirectUrl = buildRedirectUrl(profile);
      return {
        type,
        redirect: { url: redirectUrl },
      } as const satisfies Browser.declarativeNetRequest.RuleAction;
    })
    .exhaustive();
}

export function buildRedirectUrl(profile: ProfileCoreData) {
  const trimmed = profile.redirectUrlGroup
    ?.find(item => item.enabled)
    ?.value
    .trim();
    // An empty string is not a valid redirect URL and will cause an error during rule registration, so we convert it to `undefined` to let DNR treat it as if the redirectUrlGroup is not set.
  return trimmed || undefined;
}

export function buildRequestHeaders(profile: ProfileCoreData) {
  const requestHeaders: Browser.declarativeNetRequest.ModifyHeaderInfo[] = [];

  for (const group of profile.requestHeaderModGroups ?? []) {
    const enabledMods = group.items.filter(mod => mod.enabled);
    for (const mod of enabledMods) {
      if (mod.name.trim()) {
        const headerInfo = {
          header: mod.name.trim(),
          operation: mod.operation,
        } satisfies Browser.declarativeNetRequest.ModifyHeaderInfo;

        if (mod.operation === "remove") {
          requestHeaders.push(headerInfo);
        } else if (mod.value.trim()) {
          requestHeaders.push({ ...headerInfo, value: mod.value.trim() });
        }
      }
    }
  }

  // Process sync cookies as Cookie header appends
  for (const group of profile.syncCookieGroups ?? []) {
    const enabledCookies = group.items.filter(cookie => cookie.enabled);
    for (const cookie of enabledCookies) {
      if (cookie.name.trim() && cookie.value.trim()) {
        requestHeaders.push({
          header: "cookie",
          operation: "append",
          value: `${cookie.name.trim()}=${cookie.value.trim()}`,
        });
      }
    }
  }

  return requestHeaders;
}

export function buildResponseHeaders(profile: ProfileCoreData) {
  const responseHeaders: Browser.declarativeNetRequest.ModifyHeaderInfo[] = [];

  for (const group of profile.responseHeaderModGroups ?? []) {
    const enabledMods = group.items.filter(mod => mod.enabled);
    for (const mod of enabledMods) {
      if (mod.name.trim()) {
        const headerInfo: Browser.declarativeNetRequest.ModifyHeaderInfo = {
          header: mod.name.trim(),
          operation: mod.operation,
        };

        if (mod.operation === "remove") {
          responseHeaders.push(headerInfo);
        } else if (mod.value.trim()) {
          responseHeaders.push({ ...headerInfo, value: mod.value.trim() });
        }
      }
    }
  }

  return responseHeaders;
}
