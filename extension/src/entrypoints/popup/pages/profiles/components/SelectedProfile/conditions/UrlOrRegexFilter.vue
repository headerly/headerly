<script setup lang="tsx">
import type { UrlOrRegexFilter } from "@/lib/type";
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
import { computed } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

const list = defineModel<UrlOrRegexFilter[]>({
  required: true,
});

const { filterType } = defineProps<{
  filterType: "urlFilter" | "regexFilter";
}>();

const field = {
  urlFilter: {
    title: "URL Filter",
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
  },
  regexFilter: {
    title: "Regex Filter",
    description: (
      <>
        <p>
          Regular expression to match against the network request url.
        </p>
        <p>
          This follows the
          {" "}
          <a href="https://github.com/google/re2/wiki/syntax" target="_blank">RE2</a>
          {" "}
          syntax.
        </p>
      </>
    ),
  },
} as const;

const profilesStore = useProfilesStore();

function deleteGroup() {
  // Using `=undefined` will result in loss of responsiveness.
  delete profilesStore.selectedProfile.filters[filterType];
}

function newField() {
  list.value.push({
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
    v-model:list="list"
    :name="field[filterType].title"
    type="radio"
  >
    <template #name-after>
      <GroupActions
        v-model:list="list"
        :description="field[filterType].description"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <Input
        v-model="list[index]!.value"
        type="text"
        placeholder="|https://example.com/"
        class="
          flex-1
          placeholder:italic
        "
      />
      <div class="ml-1 flex gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="secondary"
                size="icon-xs"
                :disabled="!canUseCurrentUrl"
                @click="() => {
                  list[index]!.value = filterType === 'urlFilter'
                    // Metacharacters *+?()|
                    ? `|${currentUrl!.href}|` : currentUrl!.href.replaceAll(/[-\\^$*+?()|.\[\]{}:]/g, '\\$&');
                }"
              >
                <i class="i-lucide-at-sign size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Use the URL of the current tab
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          size="icon-xs"
          class="text-destructive!"
          @click="() => {
            list.splice(index, 1);
          }"
        >
          <span class="sr-only">Delete this header mod</span>
          <i class="i-lucide-x size-4" />
        </Button>
        <ActionsDropdown
          v-model:list="list"
          v-model:field="list[index]!"
          :index
        />
      </div>
    </template>
  </Group>
</template>
