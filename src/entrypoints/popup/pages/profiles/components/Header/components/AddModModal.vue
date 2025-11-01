<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useAddModModalStore } from "#/stores/useAddModModalStore";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useTemplateRef, watch } from "vue";

const dialogRef = useTemplateRef("dialogRef");

const profilesStore = useProfilesStore();

interface Tab {
  label: string;
  value: string;
  icon: string;
  items: {
    title: string;
    description: string;
    action: () => void;
    disabled?: boolean;
  }[];
}

const tabs = [
  {
    label: "Actions",
    value: "actions",
    icon: "i-lucide-cross",
    items: [
      {
        title: "Modify HTTP Request Header (Checkbox)",
        description: "Set, remove, or append HTTP request headers.",
        action: () => profilesStore.addModGroup("request", "checkbox"),
      },
      {
        title: "Modify HTTP Request Header (Radio)",
        description: "Set, remove, or append HTTP request headers.",
        action: () => profilesStore.addModGroup("request", "radio"),
      },
      {
        title: "Modify HTTP Response Header (Checkbox)",
        description: "Set, remove, or append HTTP response headers.",
        action: () => profilesStore.addModGroup("response", "checkbox"),
      },
      {
        title: "Modify HTTP Response Header (Radio)",
        description: "Set, remove, or append HTTP response headers.",
        action: () => profilesStore.addModGroup("response", "radio"),
      },
      {
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
      },
    ],
  },
  {
    label: "Conditions",
    value: "conditions",
    icon: "i-lucide-list-filter-plus",
    items: [
      {
        title: "URL Filter",
        description: "The rule will only match network requests whose URL contains any of the specified substrings. If the list is omitted, the rule is applied to requests with all URLs. An empty list is not allowed. Only one of urlFilter or regexFilter can be specified.",
        action: async () => {
          const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
          const url = new URL(currentTab?.url ?? "");
          profilesStore.selectedProfile.filters.urlFilter = [
            {
              id: crypto.randomUUID(),
              enabled: true,
              value: ["https", "http"].includes(url.protocol) ? `||${url.hostname}/` : "",
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
        title: "Request Domains",
        description: "The rule will only match network requests when the domain matches one from the list of requestDomains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.",
        action: async () => {
          const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
          const url = new URL(currentTab?.url ?? "");
          profilesStore.selectedProfile.filters.requestDomains = {
            type: "checkbox",
            items: [
              {
                id: crypto.randomUUID(),
                enabled: true,
                value: ["https", "http"].includes(url.protocol) ? url.hostname : "",
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
        title: "Excluded Request Domains",
        description: "The rule will not match network requests when the domains matches one from the list of excludedRequestDomains. If the list is empty or omitted, no domains are excluded. This takes precedence over requestDomains.",
        action: async () => {
          const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
          const url = new URL(currentTab?.url ?? "");
          profilesStore.selectedProfile.filters.excludedRequestDomains = {
            type: "checkbox",
            items: [
              {
                id: crypto.randomUUID(),
                enabled: true,
                value: ["https", "http"].includes(url.protocol) ? url.hostname : "",
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
        title: "Regex Filter",
        description: "The rule will only match network requests whose URL contains any of the specified substrings. If the list is omitted, the rule is applied to requests with all URLs. An empty list is not allowed. Only one of urlFilter or regexFilter can be specified.",
        action: () => {
          profilesStore.selectedProfile.filters.regexFilter = [
            {
              id: crypto.randomUUID(),
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
        title: "Specified Tabs",
        description: "List of tab IDs which the rule should match. An ID of TAB_ID_NONE includes requests which don't originate from a tab. An empty list is not allowed. Only supported for session-scoped rules.",
        action: () => {},
      },
      {
        title: "Excluded Specified Tabs",
        description: "List of tab IDs which the rule should not match. An ID of TAB_ID_NONE excludes requests which don't originate from a tab. Only supported for session-scoped rules.",
        action: () => {},
      },
      {
        title: "Domain Type",
        description: "Specifies whether the network request is first-party or third-party to the domain from which it originated.",
        action: () => {},
      },
      {
        title: "Excluded Domain Type",
        description: "Excludes requests based on whether the network request is first-party or third-party to the domain from which it originated. If omitted, all requests are accepted.",
        action: () => {},
      },
      {
        title: "Initiator Domains",
        description: "The rule will only match network requests originating from the list of initiator domains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.",
        action: async () => {
          const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
          const url = new URL(currentTab?.url ?? "");
          profilesStore.selectedProfile.filters.initiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: crypto.randomUUID(),
                enabled: true,
                value: ["https", "http"].includes(url.protocol) ? url.hostname : "",
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
        title: "Excluded Initiator Domains",
        description: "The rule will not match network requests originating from the list of excluded initiator domains. If the list is empty or omitted, no domains are excluded. This takes precedence over initiator domains.",
        action: async () => {
          const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
          const url = new URL(currentTab?.url ?? "");
          profilesStore.selectedProfile.filters.excludedInitiatorDomains = {
            type: "checkbox",
            items: [
              {
                id: crypto.randomUUID(),
                enabled: true,
                value: ["https", "http"].includes(url.protocol) ? url.hostname : "",
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
        title: "Request Methods",
        description: "List of HTTP request methods which the rule can match. An empty list is not allowed. Note: Specifying requestMethods will also exclude non-HTTP(s) requests.",
        action: () => {},
      },
      {
        title: "Excluded Request Methods",
        description: "List of request methods which the rule won't match. Only one of requestMethods and excludedRequestMethods should be specified. If neither is specified, all request methods are matched.",
        action: () => {},
      },
      {
        title: "Resource Types",
        description: "List of resource types which the rule can match. An empty list is not allowed.",
        action: () => {},
      },
      {
        title: "Excluded Resource Types",
        description: "List of resource types which the rule won't match. Only one of resourceTypes and excludedResourceTypes should be specified. If neither is specified, all resource types except main_frame are blocked.",
        action: () => {},
      },
      {
        title: "Response Headers",
        description: "Rule matches if the request matches any response header condition in this list (if specified).",
        action: () => {},
      },
      {
        title: "Excluded Response Headers",
        description: "Rule does not match if the request matches any response header condition in this list (if specified). If both excludedResponseHeaders and responseHeaders are specified, then excludedResponseHeaders takes precedence.",
        action: () => {},
      },
    ],
  },
] satisfies Tab[];

const addModModalStore = useAddModModalStore();

const UI_TEXT = {
  close: "✕",
  closeModal: "Close modal",
} as const;

watch(() => addModModalStore.isOpen, (newValue) => {
  if (newValue) {
    dialogRef.value?.showModal();
  }
});
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          class="btn btn-square btn-ghost btn-sm btn-primary"
          @click="() => {
            addModModalStore.currentTab = 'actions';
            addModModalStore.isOpen = true
          }"
        >
          <i class="i-lucide-cross size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Add a new action
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <TooltipProvider :delay-duration="200">
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          class="btn btn-square btn-ghost btn-sm btn-primary"
          @click="() => {
            addModModalStore.currentTab = 'conditions';
            addModModalStore.isOpen = true
          }"
        >
          <i class="i-lucide-list-filter-plus size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        Add a new condition
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button
          class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
          @click="addModModalStore.isOpen = false"
        >
          {{ UI_TEXT.close }}
          <span class="sr-only">{{ UI_TEXT.closeModal }}</span>
        </button>
      </form>

      <div class="tabs-box mt-5 tabs">
        <template v-for="tab in tabs" :key="tab.label">
          <label class="tab w-1/2">
            <input v-model="addModModalStore.currentTab" type="radio" name="add-action-or-condition" :value="tab.value">
            <i :class="tab.icon" class="me-2 size-4" />
            {{ tab.label }}
          </label>
          <div
            class="
              tab-content mt-1 max-h-[70vh] overflow-y-auto border-base-300
            "
          >
            <div class="list rounded-box">
              <button
                v-for="{ title, description, action, disabled } in tab.items"
                :key="title"
                :disabled="disabled"
                class="list-row btn h-min text-start btn-ghost"
                :class="{ 'btn-disabled opacity-50': disabled }"
                @click="() => {
                  if (!disabled) {
                    action()
                    addModModalStore.isOpen = false
                    dialogRef?.close()
                  }
                }"
              >
                <div>
                  <div>{{ title }}</div>
                  <div class="text-xs font-normal opacity-60">
                    {{ description }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </dialog>
</template>
