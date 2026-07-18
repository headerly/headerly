import { match } from "ts-pattern";

export type UrlOrRegexFilterType = "urlFilter" | "regexFilter";

function escapeRegexValue(value: string) {
  return value.replaceAll(/[-\\^$*+?()|.[\]{}:]/g, "\\$&");
}

export function getDefaultFilterValueByHost(filterType: UrlOrRegexFilterType, host: string) {
  return match([filterType, Boolean(host)] as const)
    .with(["urlFilter", true], () => `||${host}/*`)
    .with(["regexFilter", true], () => `^https?:\\/\\/${escapeRegexValue(host)}\\/.*`)
    .otherwise(() => "");
}
