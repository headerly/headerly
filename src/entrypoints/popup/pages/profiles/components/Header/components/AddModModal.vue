<script setup lang="ts">
import { useProfilesStore } from "#/stores/useProfilesStore";
import { ref } from "vue";
import { cn } from "@/lib/utils";

const dialogRef = ref<HTMLDialogElement | null>(null);

const profilesStore = useProfilesStore();

interface Tab {
  label: string;
  value: string;
  icon: string;
  items: {
    title: string;
    description: string;
    icon: string;
    action: () => void;
    excluded?: boolean;
  }[];
}

const tabs = [
  {
    label: "Action",
    value: "action",
    icon: "i-lucide-package-plus",
    items: [
      {
        title: "Modify HTTP Request Header",
        description: "Set, remove, or append HTTP request headers.",
        icon: "i-lucide-arrow-big-right-dash",
        action: () => profilesStore.addHeaderAction("request"),
      },
      {
        title: "Modify HTTP Response Header",
        description: "Set, remove, or append HTTP response headers.",
        icon: "i-lucide-arrow-big-left-dash",
        action: () => profilesStore.addHeaderAction("response"),
      },
      {
        title: "Append Cookie in Request Header",
        description: "Append individual cookie in HTTP request header.",
        icon: "i-lucide-cookie",
        action: () => {},
      },
    ],
  },
  {
    label: "Condition",
    value: "condition",
    icon: "i-lucide-list-filter-plus",
    items: [
      {
        title: "URL Filter",
        description: "The rule will only match network requests whose URL contains any of the specified substrings. If the list is omitted, the rule is applied to requests with all URLs. An empty list is not allowed.",
        icon: "i-lucide-link",
        action: () => {},
      },
      {
        title: "Regex Filter",
        description: "The rule will only match network requests whose URL contains any of the specified substrings. If the list is omitted, the rule is applied to requests with all URLs. An empty list is not allowed.",
        icon: "i-lucide-asterisk",
        action: () => {},
      },
      {
        title: "Specified Tabs",
        description: "List of tab IDs which the rule should match. An ID of TAB_ID_NONE includes requests which don't originate from a tab. An empty list is not allowed. Only supported for session-scoped rules.",
        icon: "i-lucide-rectangle-horizontal",
        action: () => {},
      },
      {
        title: "Excluded Specified Tabs",
        description: "List of tab IDs which the rule should not match. An ID of TAB_ID_NONE excludes requests which don't originate from a tab. Only supported for session-scoped rules.",
        icon: "i-lucide-rectangle-horizontal",
        action: () => {},
        excluded: true,
      },
      {
        title: "Domain Type",
        description: "Specifies whether the network request is first-party or third-party to the domain from which it originated.",
        icon: "i-lucide-wifi",
        action: () => {},
      },
      {
        title: "Excluded Domain Type",
        description: "Excludes requests based on whether the network request is first-party or third-party to the domain from which it originated. If omitted, all requests are accepted.",
        icon: "i-lucide-wifi",
        action: () => {},
        excluded: true,
      },
      {
        title: "Initiator Domains",
        description: "The rule will only match network requests originating from the list of initiator domains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.",
        icon: "i-lucide-globe",
        action: () => {},
      },
      {
        title: "Excluded Initiator Domains",
        description: "The rule will not match network requests originating from the list of excluded initiator domains. If the list is empty or omitted, no domains are excluded. This takes precedence over initiator domains.",
        icon: "i-lucide-globe",
        action: () => {},
        excluded: true,
      },
      {
        title: "Request Domains",
        description: "The rule will only match network requests when the domain matches one from the list of requestDomains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.",
        icon: "i-lucide-server",
        action: () => {},
      },
      {
        title: "Excluded Request Domains",
        description: "The rule will not match network requests when the domains matches one from the list of excludedRequestDomains. If the list is empty or omitted, no domains are excluded. This takes precedence over requestDomains.",
        icon: "i-lucide-server",
        action: () => {},
        excluded: true,
      },
      {
        title: "Request Methods",
        description: "List of HTTP request methods which the rule can match. An empty list is not allowed. Note: Specifying requestMethods will also exclude non-HTTP(s) requests.",
        icon: "i-lucide-zap",
        action: () => {},
      },
      {
        title: "Excluded Request Methods",
        description: "List of request methods which the rule won't match. Only one of requestMethods and excludedRequestMethods should be specified. If neither is specified, all request methods are matched.",
        icon: "i-lucide-zap",
        action: () => {},
        excluded: true,
      },
      {
        title: "Resource Types",
        description: "List of resource types which the rule can match. An empty list is not allowed.",
        icon: "i-lucide-file",
        action: () => {},
      },
      {
        title: "Excluded Resource Types",
        description: "List of resource types which the rule won't match. Only one of resourceTypes and excludedResourceTypes should be specified. If neither is specified, all resource types except main_frame are blocked.",
        icon: "i-lucide-file",
        action: () => {},
        excluded: true,
      },
      {
        title: "Response Headers",
        description: "Rule matches if the request matches any response header condition in this list (if specified).",
        icon: "i-lucide-list",
        action: () => {},
      },
      {
        title: "Excluded Response Headers",
        description: "Rule does not match if the request matches any response header condition in this list (if specified). If both excludedResponseHeaders and responseHeaders are specified, then excludedResponseHeaders takes precedence.",
        icon: "i-lucide-list",
        action: () => {},
        excluded: true,
      },
    ],
  },
] satisfies Tab[];

const selectedTab = ref("action");
</script>

<template>
  <button
    class="btn btn-square btn-ghost btn-sm btn-primary"
    @click="dialogRef?.showModal()"
  >
    <i class="i-lucide-cross size-4" />
  </button>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">
          ✕
          <span class="sr-only">Close modal</span>
        </button>
      </form>

      <div class="tabs-box mt-5 tabs">
        <template v-for="tab in tabs" :key="tab.label">
          <label class="tab w-1/2">
            <input v-model="selectedTab" type="radio" name="add-action-or-condition" :value="tab.value">
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
                v-for="{ title, description, icon, action, excluded } in tab.items"
                :key="title"
                class="list-row btn h-min text-start btn-ghost"
                @click="() => {
                  action()
                  dialogRef?.close()
                }"
              >
                <i :class="icon" class="size-6" />
                <div>
                  <div>{{ title }}</div>
                  <div class="text-xs font-normal opacity-60">
                    {{ description }}
                  </div>
                </div>
                <i
                  :class="cn('size-5 bg-primary', excluded ? `i-lucide-ban` : `
                    i-lucide-plus
                  `)"
                />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </dialog>
</template>
