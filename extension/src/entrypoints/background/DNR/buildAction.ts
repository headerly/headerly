import type { ProfileCoreData } from "..";
import type { QueryTransform as ProfileQueryTransform } from "@/lib/schema";
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
      const regexSubstitution = buildRedirectRegexSubstitution(profile);
      const transform = buildRedirectTransform(profile);
      return {
        type,
        redirect: {
          url: redirectUrl,
          regexSubstitution,
          transform,
        },
      } as const satisfies Browser.declarativeNetRequest.RuleAction;
    })
    .exhaustive();
}

export function buildRedirectUrl(profile: ProfileCoreData) {
  return getEnabledTrimmedValue(profile.redirectUrlGroup);
}

export function buildRedirectRegexSubstitution(profile: ProfileCoreData) {
  return getEnabledTrimmedValue(profile.redirectRegexSubstitution);
}

export function buildRedirectTransform(profile: ProfileCoreData) {
  const transform = profile.redirectTransform;
  if (!transform) {
    return undefined;
  }

  const queryTransform = buildQueryTransform(transform.queryTransform);
  const builtTransform: Browser.declarativeNetRequest.URLTransform = {
    fragment: getEnabledTrimmedValue(transform.fragment),
    host: getEnabledTrimmedValue(transform.host),
    password: getEnabledTrimmedValue(transform.password),
    path: getEnabledTrimmedValue(transform.path),
    port: getEnabledTrimmedValue(transform.port),
    query: getEnabledTrimmedValue(transform.query),
    scheme: getEnabledTrimmedValue(transform.scheme),
    username: getEnabledTrimmedValue(transform.username),
    queryTransform,
  };

  return hasDefinedValues(builtTransform) ? builtTransform : undefined;
}

function buildQueryTransform(queryTransform?: ProfileQueryTransform) {
  if (!queryTransform) {
    return undefined;
  }

  const addOrReplaceParams: Browser.declarativeNetRequest.QueryKeyValue[] = [];
  for (const item of queryTransform.addOrReplaceParams?.items ?? []) {
    if (!item.enabled) {
      continue;
    }
    const key = item.key.trim();
    const value = item.value.trim();
    if (!key || !value) {
      continue;
    }
    addOrReplaceParams.push({
      key,
      value,
      replaceOnly: item.replaceOnly ? true : undefined,
    });
  }

  const removeParams: string[] = [];
  for (const item of queryTransform.removeParams?.items ?? []) {
    if (!item.enabled) {
      continue;
    }
    const value = item.value.trim();
    if (!value) {
      continue;
    }
    removeParams.push(value);
  }

  if (!addOrReplaceParams.length && !removeParams.length) {
    return undefined;
  }

  return {
    addOrReplaceParams: addOrReplaceParams.length ? addOrReplaceParams : undefined,
    removeParams: removeParams.length ? removeParams : undefined,
  } as const satisfies Browser.declarativeNetRequest.QueryTransform;
}

function getEnabledTrimmedValue(
  list?: Array<{ enabled: boolean; value: string }>,
) {
  const trimmed = list
    ?.find(item => item.enabled)
    ?.value
    .trim();
  // Empty strings are not valid for redirect action values in DNR; convert to undefined so the field is omitted.
  return trimmed || undefined;
}

function hasDefinedValues(record: object) {
  return Object.values(record).some(value => value !== undefined);
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
