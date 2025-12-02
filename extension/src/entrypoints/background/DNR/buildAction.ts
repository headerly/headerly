import type { ProfileCoreData } from "..";

export function buildAction(profile: ProfileCoreData) {
  const requestHeaders = buildRequestHeaders(profile);
  const responseHeaders = buildResponseHeaders(profile);
  const action = {
    type: "modifyHeaders",
    requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
    responseHeaders: responseHeaders.length > 0 ? responseHeaders : undefined,
  } as const satisfies Browser.declarativeNetRequest.RuleAction;
  return action;
}

function buildRequestHeaders(profile: ProfileCoreData) {
  const requestHeaders: Browser.declarativeNetRequest.ModifyHeaderInfo[] = [];

  for (const group of profile.requestHeaderModGroups) {
    const enabledMods = group.items.filter(mod => mod.enabled);
    for (const mod of enabledMods) {
      if (mod.name.trim()) {
        const headerInfo = {
          // `toLowerCase()` is only for compatibility with older browsers.
          // https://issues.chromium.org/issues/449152902 was fixed on 2025-10-31.
          header: mod.name.trim().toLowerCase(),
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
  for (const group of profile.syncCookieGroups) {
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

function buildResponseHeaders(profile: ProfileCoreData) {
  const responseHeaders: Browser.declarativeNetRequest.ModifyHeaderInfo[] = [];

  for (const group of profile.responseHeaderModGroups) {
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
