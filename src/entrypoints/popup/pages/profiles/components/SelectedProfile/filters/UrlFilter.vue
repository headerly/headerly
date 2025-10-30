<script setup lang="tsx">
import type { Filter } from "@/lib/storage";
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

const list = defineModel<NonNullable<Filter["urlFilter"]>>("list", {
  required: true,
});

const field = {
  title: "URL Filter",
  placeholder: "|https://google.com/",
  description: (
    <>
      <p>
        <a
          href="https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#url_filter_syntax"
          target="_blank"
        >
          URL pattern syntax
        </a>
      </p>
      <ul>
        <li>
          <code>*</code>
          — Wildcard: matches any characters.
        </li>
        <li>
          <code>|</code>
          — Anchor: marks start or end of the URL.
        </li>
        <li>
          <code>||</code>
          — Domain anchor: matches start of a (sub)domain.
        </li>
        <li>
          <code>^</code>
          — Separator: matches anything except letters, digits,
          <code>_ - . %</code>
          , or end of URL.
        </li>
      </ul>
      <p>
        Format: (optional anchor) + pattern + (optional anchor)
      </p>
      <p>Omitted = all URLs match. Empty string not allowed.</p>
      <p>Note: Only one of urlFilter or regexFilter can be used.</p>
    </>
  ),
};

const profilesStore = useProfilesStore();

function deleteGroup() {
  // Using `=undefined` will result in loss of responsiveness.
  delete profilesStore.selectedProfile.filters.urlFilter;
}

function newField() {
  list.value.push({
    id: crypto.randomUUID(),
    enabled: false,
    value: "",
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
    v-if="list?.length"
    v-model:list="list"
    :name="field.title"
    type="radio"
  >
    <template #name-after>
      <GroupActions
        v-model:list="list"
        :description="field.description"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <input
        v-model="list[index]!.value"
        type="text"
        :placeholder="field.placeholder"
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
                  list[index]!.value = `|${currentUrl!.href}|`;
                }"
              >
                <i class="i-lucide-at-sign size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Use the URL of the current tab
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button
          class="btn btn-square btn-ghost btn-xs btn-error"
          @click="() => {
            list.splice(index, 1);
          }"
        >
          <span class="sr-only">Delete this header mod</span>
          <i class="i-lucide-x size-4" />
        </button>
        <ActionsDropdown
          v-model:list="list"
          v-model:field="list[index]!"
          :index
        />
      </div>
    </template>
  </Group>
</template>
