import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";
import { useI18n } from "vue-i18n";
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

export function useCreateTabs(): Tab[] {
  const { t } = useI18n();
  const profilesStore = useProfilesStore();

  return [
    {
      label: t("addModModal.tabs.actions"),
      value: "actions",
      items: [
        {
          key: "modify-request-header",
          title: t("addModModal.items.modifyRequestHeader.title"),
          description: t("addModModal.items.modifyRequestHeader.description"),
          action: () => profilesStore.addModGroup("request", "checkbox"),
          get disabled() {
            return profilesStore.selectedProfile.ruleActionType !== "modifyHeaders";
          },
        },
        {
          key: "modify-response-header",
          title: t("addModModal.items.modifyResponseHeader.title"),
          description: t("addModModal.items.modifyResponseHeader.description"),
          action: () => profilesStore.addModGroup("response", "checkbox"),
          get disabled() {
            return profilesStore.selectedProfile.ruleActionType !== "modifyHeaders";
          },
        },
        {
          key: "cookie-sync-request-header",
          title: t("addModModal.items.cookieSyncRequestHeader.title"),
          description: t("addModModal.items.cookieSyncRequestHeader.description"),
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
          title: t("addModModal.items.simpleRedirectUrl.title"),
          description: t("addModModal.items.simpleRedirectUrl.description"),
          action: () => profilesStore.addRedirectUrlGroup(),
          get disabled() {
            return profilesStore.selectedProfile.ruleActionType !== "redirect"
              || Boolean(profilesStore.selectedProfile.redirectUrlGroup?.length);
          },
        },
      ],
    },
    {
      label: t("addModModal.tabs.conditions"),
      value: "conditions",
      items: [
        {
          key: "url-filter",
          title: t("addModModal.items.urlFilter.title"),
          description: t("addModModal.items.urlFilter.description"),
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
          title: t("addModModal.items.regexFilter.title"),
          description: t("addModModal.items.regexFilter.description"),
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
          title: t("addModModal.items.requestDomains.title"),
          description: t("addModModal.items.requestDomains.description"),
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
          title: t("addModModal.items.excludedRequestDomains.title"),
          description: t("addModModal.items.excludedRequestDomains.description"),
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
        {
          key: "domain-type",
          title: t("addModModal.items.domainType.title"),
          description: t("addModModal.items.domainType.description"),
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
          title: t("addModModal.items.excludedDomainType.title"),
          description: t("addModModal.items.excludedDomainType.description"),
          action: () => {},
        },
        {
          key: "initiator-domains",
          title: t("addModModal.items.initiatorDomains.title"),
          description: t("addModModal.items.initiatorDomains.description"),
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
          title: t("addModModal.items.excludedInitiatorDomains.title"),
          description: t("addModModal.items.excludedInitiatorDomains.description"),
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
          title: t("addModModal.items.requestMethods.title"),
          description: t("addModModal.items.requestMethods.description"),
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
          title: t("addModModal.items.excludedRequestMethods.title"),
          description: t("addModModal.items.excludedRequestMethods.description"),
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
          title: t("addModModal.items.resourceTypes.title"),
          description: t("addModModal.items.resourceTypes.description"),
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
          title: t("addModModal.items.excludedResourceTypes.title"),
          description: t("addModModal.items.excludedResourceTypes.description"),
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
          title: t("addModModal.items.urlRegexFilterCaseSensitive.title"),
          description: t("addModModal.items.urlRegexFilterCaseSensitive.description"),
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
}
