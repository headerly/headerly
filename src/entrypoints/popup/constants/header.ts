/**
 * See ![Inconsistency: DNR modifyHeaders supported headers](https://github.com/w3c/webextensions/issues/372).
 */

import { union, without } from "es-toolkit";

/**
 * https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#header_modification
 */
export const APPENDABLE_REQUEST_FIELDS = [
  "accept",
  "accept-encoding",
  "accept-language",
  "access-control-request-headers",
  "cache-control",
  "connection",
  "content-language",
  "cookie",
  "forwarded",
  "if-match",
  "if-none-match",
  "keep-alive",
  "range",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "user-agent",
  "via",
  "want-digest",
  "x-forwarded-for",
] as const;

/**
 * https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Standard_request_fields
 */
export const STANDARD_REQUEST_FIELDS = [
  "a-im",
  "accept",
  "accept-charset",
  "accept-datetime",
  "accept-encoding",
  "accept-language",
  "access-control-request-headers",
  "access-control-request-method",
  "authorization",
  "cache-control",
  "connection",
  "content-encoding",
  "content-length",
  "content-type",
  "cookie",
  "date",
  "expect",
  "forwarded",
  "from",
  "host",
  "if-match",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "if-unmodified-since",
  "max-forwards",
  "prefer",
  "proxy-authorization",
  "range",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "user-agent",
  "via",
] as const;

/**
 * https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Common_non-standard_request_fields
 */
export const COMMON_NON_STANDARD_REQUEST_FIELDS = [
  "dnt",
  "front-end-https",
  "proxy-connection",
  "save-data",
  "sec-gpc",
  "upgrade-insecure-requests",
  "x-att-deviceid",
  "x-correlation-id",
  "x-csrf-token",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-http-method-override",
  "x-request-id",
  "x-requested-with",
  "x-uidh",
  "x-wap-profile",
] as const;

/**
 *https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Standard_response_fields
 */
export const STANDARD_RESPONSE_FIELDS = [
  "accept-patch",
  "accept-ranges",
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-allow-origin",
  "access-control-expose-headers",
  "access-control-max-age",
  "age",
  "allow",
  "alt-svc",
  "cache-control",
  "connection",
  "content-disposition",
  "content-encoding",
  "content-language",
  "content-length",
  "content-location",
  "content-range",
  "content-type",
  "date",
  "delta-base",
  "etag",
  "expires",
  "im",
  "last-modified",
  "link",
  "location",
  "p3p",
  "pragma",
  "preference-applied",
  "proxy-authenticate",
  "public-key-pins",
  "retry-after",
  "server",
  "set-cookie",
  "strict-transport-security",
  "tk",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "vary",
  "via",
  "www-authenticate",
] as const;

/**
 * https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Common_non-standard_response_fields
 */
export const COMMON_NON_STANDARD_RESPONSE_FIELDS = [
  "content-security-policy",
  "expect-ct",
  "nel",
  "permissions-policy",
  "refresh",
  "report-to",
  "status",
  "timing-allow-origin",
  "x-content-duration",
  "x-content-security-policy",
  "x-content-type-options",
  "x-correlation-id",
  "x-powered-by",
  "x-redirect-by",
  "x-request-id",
  "x-ua-compatible",
  "x-webkit-csp",
  "x-xss-protection",
] as const;

/**
 * Chrome/Firefox cannot modify these request headers.
 * https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_request_header
 */
export const FORBIDDEN_REQUEST_FIELDS = [
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "permissions-policy",
  "proxy-authenticate",
  "proxy-authorization",
  "proxy-connection",
  "referer",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-user",
  "sec-purpose",
  "sec-websocket-accept",
  "sec-websocket-extensions",
  "sec-websocket-key",
  "sec-websocket-protocol",
  "sec-websocket-version",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
  "x-http-method",
  "x-http-method-override",
  "x-method-override",
] as const;

/**
 * Chrome/Firefox cannot modify these response headers.
 * https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_response_header_name
 */
export const FORBIDDEN_RESPONSE_FIELDS = [
  "set-cookie",
] as const;

export const AUTOCOMPLETE_APPEND_REQUEST_FIELDS = APPENDABLE_REQUEST_FIELDS.toSorted();

export const AUTOCOMPLETE_SET_AND_REMOVE_REQUEST_FIELDS = without(
  union(
    STANDARD_REQUEST_FIELDS,
    COMMON_NON_STANDARD_REQUEST_FIELDS,
  ),
  ...FORBIDDEN_REQUEST_FIELDS,
).toSorted();

export const AUTOCOMPLETE_RESPONSE_FIELDS = without(union(
  STANDARD_RESPONSE_FIELDS,
  COMMON_NON_STANDARD_RESPONSE_FIELDS,
), ...FORBIDDEN_RESPONSE_FIELDS).toSorted();
