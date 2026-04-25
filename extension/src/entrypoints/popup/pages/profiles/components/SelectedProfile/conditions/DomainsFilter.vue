<script setup lang="tsx">
import type { DomainsFilter } from "@/lib/schema";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useQuery } from "@tanstack/vue-query";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup } from "@/lib/utils";

const domainsFilter = defineModel<DomainsFilter>({
  required: true,
});

const { filterType } = defineProps<{
  filterType: "requestDomains" | "excludedRequestDomains" | "initiatorDomains" | "excludedInitiatorDomains";
}>();

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

const profilesStore = useProfilesStore();

function deleteGroup() {
  // Using `=undefined` will result in loss of responsiveness.
  delete profilesStore.selectedProfile.filters[filterType];
}

function newField() {
  const item = {
    id: uuidv7(),
    enabled: true,
    value: "",
  };
  addItemToGroup(domainsFilter.value.items, item, domainsFilter.value.type);
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
    v-model:list="domainsFilter.items"
    :name="field[filterType].title"
    :type="domainsFilter.type"
    @delete-empty-group="deleteGroup"
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
      <div
        class="
          flex flex-1 flex-col items-end gap-1
          sm:flex-row sm:items-center
        "
      >
        <Input
          v-model.trim.lazy="domainsFilter.items[index]!.value"
          placeholder="example.com"
          class="
            w-full text-base
            placeholder:italic
          "
        />
        <div class="flex gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  :disabled="!canUseCurrentUrl"
                  @click="() => {
                    domainsFilter.items[index]!.value = currentUrl!.hostname;
                  }"
                >
                  <i class="i-lucide-at-sign size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use the domain of the current tab
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="secondary"
            size="icon-xs"
            @click="() => {
              domainsFilter.items.splice(index, 1);
            }"
          >
            <span class="sr-only">Delete this domain</span>
            <i class="i-lucide-x size-4" />
          </Button>
          <ActionsDropdown
            v-model:list="domainsFilter.items"
            v-model:field="domainsFilter.items[index]!"
            :index
          />
        </div>
      </div>
    </template>
  </Group>
</template>
