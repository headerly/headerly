<script setup lang="tsx">
import type { UrlOrRegexFilterItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { useCurrentTabUrl } from "#/composables/useCurrentTabUrl";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getDefaultFilterValueByHost } from "@/lib/filter";
import { addItemToGroup } from "@/lib/group";
import { getProfileFilterGroupOpenStateId } from "@/lib/openState";

const list = defineModel<UrlOrRegexFilterItem[]>({
  required: true,
});

const { filterType } = defineProps<{
  filterType: "urlFilter" | "regexFilter";
}>();

const { t } = useI18n();

const field = computed(() => ({
  urlFilter: {
    title: t("condition.urlFilter.title"),
    placeholder: "||example.com/*",
    documentationLink: "https://headerly.dev/reference/conditions/url-filter",
  },
  regexFilter: {
    title: t("condition.regexFilter.title"),
    placeholder: String.raw`^https?:\/\/example\.com\/.*`,
    documentationLink: "https://headerly.dev/reference/conditions/regex-filter",
  },
} as const));

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
  addItemToGroup(list.value, item, "radio");
}

const { currentUrl, canUseCurrentUrl } = useCurrentTabUrl();

function getCurrentTabHost() {
  return currentUrl.value?.host ?? "";
}
</script>

<template>
  <Group
    :id="getProfileFilterGroupOpenStateId(profilesStore.selectedProfile.id, filterType)"
    v-model:list="list"
    :name="field[filterType].title"
    type="radio"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="list"
        :documentation-link="field[filterType].documentationLink"
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
          v-model.trim="list[index]!.value"
          :placeholder="field[filterType].placeholder"
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
                    const host = getCurrentTabHost();
                    list[index]!.value = getDefaultFilterValueByHost(filterType, host);
                  }"
                >
                  <i class="i-lucide-at-sign size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {{ t("condition.urlFilter.useCurrentTabRootUrl") }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="secondary"
            size="icon-xs"
            @click="() => {
              list.splice(index, 1);
            }"
          >
            <span class="sr-only">{{ t("common.deleteHeaderMod") }}</span>
            <i class="i-lucide-x size-4" />
          </Button>
          <ActionsDropdown
            v-model:list="list"
            v-model:field="list[index]!"
            :index
          />
        </div>
      </div>
    </template>
  </Group>
</template>
