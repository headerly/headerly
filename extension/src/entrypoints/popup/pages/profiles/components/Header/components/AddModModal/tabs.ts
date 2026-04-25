import { uuidv7 } from "uuidv7";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

interface Tab {
  label: string;
  value: "actions" | "conditions";
  items: {
    key: string;
    title: string;
    description: string;
    action: () => void;
    disabled?: boolean;
  }[];
}

const profilesStore = useProfilesStore();

async function getCurrentTabHostname() {
  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
  // Try to construct URL object, return null if invalid URL(for example, `chrome://extensions/`)
  try {
    const url = new URL(currentTab?.url ?? "");
    if (!url) {
      return "";
    }
    return (["https", "http"].includes(url.protocol) ? url.hostname : "");
  } catch {
    return "";
  }
}

export const tabs: Tab[] = [
  {
    label: "Actions",
    value: "actions",
    items: [
      {
        key: "modify-request-header",
        title: "Modify HTTP Request Header",
        description: "Set, remove, or append HTTP request headers.",
        action: () => profilesStore.addModGroup("request", "checkbox"),
        get disabled() {
          return profilesStore.selectedProfile.ruleActionType !== "modifyHeaders";
        },
      },
      {
        key: "modify-response-header",
        title: "Modify HTTP Response Header",
        description: "Set, remove, or append HTTP response headers.",
        action: () => profilesStore.addModGroup("response", "checkbox"),
        get disabled() {
          return profilesStore.selectedProfile.ruleActionType !== "modifyHeaders";
        },
      },
      {
        key: "cookie-sync-request-header",
        title: "Cookie Sync to Request Header",
        description: "Sync cookies for a specific website to the request header (New permissions need to be granted).",
        action: async () => {
          const hasCookiesPermission = await browser.permissions.contains({ permissions: ["cookies"] });
          if (hasCookiesPermission) {
            profilesStore.addSyncCookieGroup();
          } else {
            const granted = await browser.permissions.request({ permissions: ["cookies"] });
            if (granted) {
              profilesStore.addSyncCookieGroup();
            }
          }
        },
        get disabled() {
          return profilesStore.selectedProfile.ruleActionType !== "modifyHeaders";
        },
      },
    ],
  },
  {
    label: "Conditions",
    value: "conditions",
    items: [
      {
        key: "url-filter",
        title: "URL Filter",
        description: "The rule will only match network requests whose URL contains any of the specified substrings. If the list is omitted, the rule is applied to requests with all URLs. An empty list is not allowed. Only one of urlFilter or regexFilter can be specified.",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.urlFilter = [
            {
              id: uuidv7(),
              enabled: true,
              value: hostname ? `||${hostname}/` : "",
            },
          ];
        },
        get disabled() {
          return (profilesStore.selectedProfile.filters.urlFilter
            && profilesStore.selectedProfile.filters.urlFilter.length > 0)
          || Boolean(profilesStore.selectedProfile.filters.regexFilter?.length);
        },
      },
      {
        key: "regex-filter",
        title: "Regex Filter",
        description: "The rule will only match network requests whose URL contains any of the specified substrings. If the list is omitted, the rule is applied to requests with all URLs. An empty list is not allowed. Only one of urlFilter or regexFilter can be specified.",
        action: () => {
          profilesStore.selectedProfile.filters.regexFilter = [
            {
              id: uuidv7(),
              enabled: true,
              value: "",
            },
          ];
        },
        get disabled() {
          return (profilesStore.selectedProfile.filters.urlFilter
            && profilesStore.selectedProfile.filters.urlFilter.length > 0)
          || Boolean(profilesStore.selectedProfile.filters.regexFilter?.length);
        },
      },
      {
        key: "request-domains",
        title: "Request Domains",
        description: "The rule will only match network requests when the domain matches one from the list of requestDomains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.",
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
        get disabled() {
          return profilesStore.selectedProfile.filters.requestDomains
            && profilesStore.selectedProfile.filters.requestDomains.items.length > 0;
        },
      },
      {
        key: "excluded-request-domains",
        title: "Excluded Request Domains",
        description: "The rule will not match network requests when the domains matches one from the list of excludedRequestDomains. If the list is empty or omitted, no domains are excluded. This takes precedence over requestDomains.",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.excludedRequestDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: hostname ? `||${hostname}/` : "",
              },
            ],
          };
        },
        get disabled() {
          return profilesStore.selectedProfile.filters.excludedRequestDomains
            && profilesStore.selectedProfile.filters.excludedRequestDomains.items.length > 0;
        },
      },
      // {
      //   title: "Specified Tabs",
      //   description: "List of tab IDs which the rule should match. An ID of TAB_ID_NONE includes requests which don't originate from a tab. An empty list is not allowed. Only supported for session-scoped rules.",
      //   action: () => {},
      // },
      // {
      //   title: "Excluded Specified Tabs",
      //   description: "List of tab IDs which the rule should not match. An ID of TAB_ID_NONE excludes requests which don't originate from a tab. Only supported for session-scoped rules.",
      //   action: () => {},
      // },
      {
        key: "domain-type",
        title: "Domain Type",
        description: "Specifies whether the network request is first-party or third-party to the domain from which it originated.",
        action: () => {
          profilesStore.selectedProfile.filters.domainType = {
            enabled: true,
            value: "firstParty",
          };
        },
        get disabled() {
          return Boolean(profilesStore.selectedProfile.filters.domainType);
        },
      },
      {
        key: "excluded-domain-type",
        title: "Excluded Domain Type",
        description: "Excludes requests based on whether the network request is first-party or third-party to the domain from which it originated. If omitted, all requests are accepted.",
        action: () => {},
      },
      {
        key: "initiator-domains",
        title: "Initiator Domains",
        description: "The rule will only match network requests originating from the list of initiator domains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.initiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: hostname ? `||${hostname}/` : "",
              },
            ],
          };
        },
        get disabled() {
          return profilesStore.selectedProfile.filters.initiatorDomains
            && profilesStore.selectedProfile.filters.initiatorDomains.items.length > 0;
        },
      },
      {
        key: "excluded-initiator-domains",
        title: "Excluded Initiator Domains",
        description: "The rule will not match network requests originating from the list of excluded initiator domains. If the list is empty or omitted, no domains are excluded. This takes precedence over initiator domains.",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.excludedInitiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: hostname ? `||${hostname}/` : "",
              },
            ],
          };
        },
        get disabled() {
          return profilesStore.selectedProfile.filters.excludedInitiatorDomains
            && profilesStore.selectedProfile.filters.excludedInitiatorDomains.items.length > 0;
        },
      },
      {
        key: "request-methods",
        title: "Request Methods",
        description: "List of HTTP request methods which the rule can match. An empty list is not allowed. Note: Specifying requestMethods will also exclude non-HTTP(s) requests.",
        action: () => {
          profilesStore.selectedProfile.filters.requestMethods = [
            {
              id: uuidv7(),
              enabled: true,
              value: ["get"], // Default to GET method
            },
          ];
        },
        get disabled() {
          return Boolean(profilesStore.selectedProfile.filters.requestMethods);
        },
      },
      {
        key: "excluded-request-methods",
        title: "Excluded Request Methods",
        description: "List of request methods which the rule won't match. Only one of requestMethods and excludedRequestMethods should be specified. If neither is specified, all request methods are matched.",
        action: () => {
          profilesStore.selectedProfile.filters.excludedRequestMethods = [
            {
              id: uuidv7(),
              enabled: true,
              value: ["get"], // Default to GET method
            },
          ];
        },
        get disabled() {
          return Boolean(profilesStore.selectedProfile.filters.excludedRequestMethods);
        },
      },
      {
        key: "resource-types",
        title: "Resource Types",
        description: "List of resource types which the rule can match. An empty list is not allowed.",
        action: () => {
          profilesStore.selectedProfile.filters.resourceTypes = [
            {
              id: uuidv7(),
              enabled: true,
              value: ["main_frame"], // Default to main_frame
            },
          ];
        },
        get disabled() {
          return Boolean(profilesStore.selectedProfile.filters.resourceTypes);
        },
      },
      {
        key: "excluded-resource-types",
        title: "Excluded Resource Types",
        description: "List of resource types which the rule won't match. Only one of resourceTypes and excludedResourceTypes should be specified. If neither is specified, all resource types except main_frame are blocked.",
        action: () => {
          profilesStore.selectedProfile.filters.excludedResourceTypes = [
            {
              id: uuidv7(),
              enabled: true,
              value: ["main_frame"], // Default to main_frame
            },
          ];
        },
        get disabled() {
          return Boolean(profilesStore.selectedProfile.filters.excludedResourceTypes);
        },
      },
      {
        key: "url-regex-filter-case-sensitive",
        title: "Url & Regex Filter Case Sensitive",
        description: "Specifies whether the URL filter is case sensitive.",
        action: () => {
          profilesStore.selectedProfile.filters.isUrlFilterCaseSensitive = {
            enabled: true,
            value: false,
          };
        },
        get disabled() {
          return Boolean(profilesStore.selectedProfile.filters.isUrlFilterCaseSensitive);
        },
      },
    ],
  },
];
