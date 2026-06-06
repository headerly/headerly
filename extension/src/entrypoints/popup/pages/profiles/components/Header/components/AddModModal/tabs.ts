import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

interface Tab {
  labelKey: string;
  value: "actions" | "conditions";
  items: {
    key: string;
    titleKey: string;
    descriptionKey: string;
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
    return match(["https", "http"].includes(url.protocol))
      .with(true, () => url.hostname)
      .with(false, () => "")
      .exhaustive();
  } catch {
    return "";
  }
}

function getDnrUrlFilterValue(hostname: string) {
  return match(Boolean(hostname))
    .with(true, () => `||${hostname}/`)
    .with(false, () => "")
    .exhaustive();
}

export const tabs: Tab[] = [
  {
    labelKey: "addModModal.tabs.actions",
    value: "actions",
    items: [
      {
        key: "modify-request-header",
        titleKey: "addModModal.items.modifyRequestHeader.title",
        descriptionKey: "addModModal.items.modifyRequestHeader.description",
        action: () => profilesStore.addModGroup("request", "checkbox"),
        get disabled() {
          return profilesStore.selectedProfile.ruleActionType !== "modifyHeaders";
        },
      },
      {
        key: "modify-response-header",
        titleKey: "addModModal.items.modifyResponseHeader.title",
        descriptionKey: "addModModal.items.modifyResponseHeader.description",
        action: () => profilesStore.addModGroup("response", "checkbox"),
        get disabled() {
          return profilesStore.selectedProfile.ruleActionType !== "modifyHeaders";
        },
      },
      {
        key: "cookie-sync-request-header",
        titleKey: "addModModal.items.cookieSyncRequestHeader.title",
        descriptionKey: "addModModal.items.cookieSyncRequestHeader.description",
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
      {
        key: "simple-redirect-url",
        titleKey: "addModModal.items.simpleRedirectUrl.title",
        descriptionKey: "addModModal.items.simpleRedirectUrl.description",
        action: () => profilesStore.addRedirectUrlGroup(),
        get disabled() {
          return profilesStore.selectedProfile.ruleActionType !== "redirect"
            || Boolean(profilesStore.selectedProfile.redirectUrlGroup?.length);
        },
      },
    ],
  },
  {
    labelKey: "addModModal.tabs.conditions",
    value: "conditions",
    items: [
      {
        key: "url-filter",
        titleKey: "addModModal.items.urlFilter.title",
        descriptionKey: "addModModal.items.urlFilter.description",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.urlFilter = [
            {
              id: uuidv7(),
              enabled: true,
              value: getDnrUrlFilterValue(hostname),
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
        titleKey: "addModModal.items.regexFilter.title",
        descriptionKey: "addModModal.items.regexFilter.description",
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
        titleKey: "addModModal.items.requestDomains.title",
        descriptionKey: "addModModal.items.requestDomains.description",
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
        titleKey: "addModModal.items.excludedRequestDomains.title",
        descriptionKey: "addModModal.items.excludedRequestDomains.description",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.excludedRequestDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: getDnrUrlFilterValue(hostname),
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
        titleKey: "addModModal.items.domainType.title",
        descriptionKey: "addModModal.items.domainType.description",
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
        titleKey: "addModModal.items.excludedDomainType.title",
        descriptionKey: "addModModal.items.excludedDomainType.description",
        action: () => {},
      },
      {
        key: "initiator-domains",
        titleKey: "addModModal.items.initiatorDomains.title",
        descriptionKey: "addModModal.items.initiatorDomains.description",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.initiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: getDnrUrlFilterValue(hostname),
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
        titleKey: "addModModal.items.excludedInitiatorDomains.title",
        descriptionKey: "addModModal.items.excludedInitiatorDomains.description",
        action: async () => {
          const hostname = await getCurrentTabHostname();
          profilesStore.selectedProfile.filters.excludedInitiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: uuidv7(),
                enabled: true,
                value: getDnrUrlFilterValue(hostname),
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
        titleKey: "addModModal.items.requestMethods.title",
        descriptionKey: "addModModal.items.requestMethods.description",
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
        titleKey: "addModModal.items.excludedRequestMethods.title",
        descriptionKey: "addModModal.items.excludedRequestMethods.description",
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
        titleKey: "addModModal.items.resourceTypes.title",
        descriptionKey: "addModModal.items.resourceTypes.description",
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
        titleKey: "addModModal.items.excludedResourceTypes.title",
        descriptionKey: "addModModal.items.excludedResourceTypes.description",
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
        titleKey: "addModModal.items.urlRegexFilterCaseSensitive.title",
        descriptionKey: "addModModal.items.urlRegexFilterCaseSensitive.description",
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
