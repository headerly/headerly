<script setup lang="tsx">
import type { DomainsFilter } from "@/lib/type";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

const { filterType } = defineProps<{
  filterType: "requestDomains" | "excludedRequestDomains" | "initiatorDomains" | "excludedInitiatorDomains";
}>();

const domainsFilter = defineModel<DomainsFilter>({
  required: true,
});

const field = {
  requestDomains: {
    title: "Request Domains Filter",
    description: (
      <>
        <p>
          The rule will only match network requests when the domain matches one from the list of requestDomains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.
        </p>
        <ul>
          <li>{"Sub-domains like \"a.example.com\" are also allowed."}</li>
          <li>The entries must consist of only ascii characters.</li>
          <li>Use punycode encoding for internationalized domains.</li>
        </ul>
      </>
    ),
  },
  excludedRequestDomains: {
    title: "Excluded Request Domains Filter",
    description: (
      <>
        <p>
          The rule will not match network requests when the domains matches one from the list of excludedRequestDomains. If the list is empty or omitted, no domains are excluded. This takes precedence over requestDomains.
        </p>
        <ul>
          <li>{"Sub-domains like \"a.example.com\" are also allowed."}</li>
          <li>The entries must consist of only ascii characters.</li>
          <li>Use punycode encoding for internationalized domains.</li>
        </ul>
      </>
    ),
  },
  initiatorDomains: {
    title: "Initiator Domains Filter",
    description: (
      <>
        <p>
          The rule will only match network requests originating from the list of initiatorDomains. If the list is omitted, the rule is applied to requests from all domains. An empty list is not allowed.
        </p>
        <ul>
          <li>{"Sub-domains like \"a.example.com\" are also allowed."}</li>
          <li>The entries must consist of only ascii characters.</li>
          <li>Use punycode encoding for internationalized domains.</li>
          <li>This matches against the request initiator and not the request url.</li>
        </ul>
      </>
    ),
  },
  excludedInitiatorDomains: {
    title: "Excluded Initiator Domains Filter",
    description: (
      <>
        <p>
          The rule will not match network requests originating from the list of excludedInitiatorDomains. If the list is empty or omitted, no domains are excluded. This takes precedence over initiatorDomains.
        </p>
        <ul>
          <li>{"Sub-domains like \"a.example.com\" are also allowed."}</li>
          <li>The entries must consist of only ascii characters.</li>
          <li>Use punycode encoding for internationalized domains.</li>
          <li>This matches against the request initiator and not the request url.</li>
        </ul>
      </>
    ),
  },
};

const UI_TEXT = {
  useCurrentDomain: "Use the domain of the current tab",
  deleteDomain: "Delete this domain",
} as const;

const profilesStore = useProfilesStore();

function deleteGroup() {
  // Using `=undefined` will result in loss of responsiveness.
  delete profilesStore.selectedProfile.filters[filterType];
}

function newField() {
  domainsFilter.value.items.push({
    id: crypto.randomUUID(),
    enabled: false,
    value: "",
    comments: "",
  });
}

function useCurrentUrlQuery() {
  return useQuery({
    queryKey: ["current-tab-url"],
    queryFn: async () => {
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!currentTab?.url) {
        return null;
      };
      return new URL(currentTab.url);
    },
  });
}

const { data: currentUrl, isPending } = useCurrentUrlQuery();

const canUseCurrentUrl = computed(() => {
  if (isPending.value || !currentUrl.value) {
    return false;
  }
  return currentUrl.value.protocol === "http:" || currentUrl.value.protocol === "https:";
});
</script>

<template>
  <Group
    v-if="domainsFilter.items.length"
    v-model:list="domainsFilter.items"
    :name="field[filterType].title"
    :type="domainsFilter.type"
  >
    <template #name-after>
      <GroupActions
        v-model:list="domainsFilter.items"
        v-model:type="domainsFilter.type"
        :description="field[filterType].description"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <input
        v-model="domainsFilter.items[index]!.value"
        type="text"
        placeholder="example.com"
        class="
          input input-sm w-full text-base text-base-content
          placeholder:italic
        "
      >
      <div class="ml-1 flex gap-0.5">
        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                :disabled="!canUseCurrentUrl"
                class="btn btn-square btn-soft btn-xs btn-primary"
                @click="() => {
                  domainsFilter.items[index]!.value = currentUrl!.hostname;
                }"
              >
                <i class="i-lucide-at-sign size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {{ UI_TEXT.useCurrentDomain }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button
          class="btn btn-square btn-ghost btn-xs btn-error"
          @click="() => {
            domainsFilter.items.splice(index, 1);
          }"
        >
          <span class="sr-only">{{ UI_TEXT.deleteDomain }}</span>
          <i class="i-lucide-x size-4" />
        </button>
        <ActionsDropdown
          v-model:list="domainsFilter.items"
          v-model:field="domainsFilter.items[index]!"
          :index
        />
      </div>
    </template>
  </Group>
</template>
