<script setup lang="ts" generic="T extends 'resourceTypes' | 'requestMethods' | 'excludedResourceTypes' | 'excludedRequestMethods'">
import type { GroupItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import Button from "#/ui/button/Button.vue";
import MultiSelect from "#/ui/multi-select/MultiSelect.vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup } from "@/lib/utils";

// Define specific item types
type ResourceTypeItem = GroupItem & {
  value: `${Browser.declarativeNetRequest.ResourceType}`[];
};

type RequestMethodItem = GroupItem & {
  value: `${Browser.declarativeNetRequest.RequestMethod}`[];
};

// Use conditional types to get the correct item type
type FilterItemType<K extends T>
  = K extends "resourceTypes" | "excludedResourceTypes" ? ResourceTypeItem
    : K extends "requestMethods" | "excludedRequestMethods" ? RequestMethodItem
      : never;

const list = defineModel<FilterItemType<T>[]>({
  required: true,
});

const { type } = defineProps<{
  type: T;
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();

const nameMap = {
  resourceTypes: "condition.resourceTypes.title",
  excludedResourceTypes: "condition.excludedResourceTypes.title",
  requestMethods: "condition.requestMethods.title",
  excludedRequestMethods: "condition.excludedRequestMethods.title",
};

interface ResourceTypeOption {
  value: `${Browser.declarativeNetRequest.ResourceType}`;
  labelKey: string;
}

const resourceTypeOptions = [
  { value: "csp_report", labelKey: "condition.resourceType.cspReport" },
  { value: "font", labelKey: "condition.resourceType.font" },
  { value: "image", labelKey: "condition.resourceType.image" },
  { value: "main_frame", labelKey: "condition.resourceType.mainFrame" },
  { value: "media", labelKey: "condition.resourceType.media" },
  { value: "object", labelKey: "condition.resourceType.object" },
  { value: "other", labelKey: "condition.resourceType.other" },
  { value: "ping", labelKey: "condition.resourceType.ping" },
  { value: "script", labelKey: "condition.resourceType.script" },
  { value: "stylesheet", labelKey: "condition.resourceType.stylesheet" },
  { value: "sub_frame", labelKey: "condition.resourceType.subFrame" },
  { value: "webbundle", labelKey: "condition.resourceType.webbundle" },
  { value: "websocket", labelKey: "condition.resourceType.websocket" },
  { value: "webtransport", labelKey: "condition.resourceType.webtransport" },
  { value: "xmlhttprequest", labelKey: "condition.resourceType.xmlhttprequest" },
] as const satisfies ResourceTypeOption[];

interface RequestMethodOption {
  value: `${Browser.declarativeNetRequest.RequestMethod}`;
}

const requestMethodsOptions = [
  { value: "connect" },
  { value: "delete" },
  { value: "get" },
  { value: "head" },
  { value: "options" },
  { value: "other" },
  { value: "patch" },
  { value: "post" },
  { value: "put" },
] as const satisfies RequestMethodOption[];

const optionsMap = {
  resourceTypes: resourceTypeOptions,
  requestMethods: requestMethodsOptions,
  excludedResourceTypes: resourceTypeOptions,
  excludedRequestMethods: requestMethodsOptions,
};

const options = computed(() => optionsMap[type]);

// Convert available options to MultiSelect options
const multiSelectOptions = computed(() =>
  options.value.map((option) => {
    let label = option.value.toUpperCase();
    if ("labelKey" in option) {
      label = t(option.labelKey);
    }
    return {
      value: option.value,
      label,
      disabled: false,
    };
  }),
);

function deleteGroup() {
  delete profilesStore.selectedProfile.filters[type];
}

function newField() {
  const newItem = {
    id: uuidv7(),
    enabled: true,
    value: [],
  } as unknown as FilterItemType<T>;

  addItemToGroup(list.value, newItem, "radio");
}
</script>

<template>
  <Group
    v-model:list="list"
    :name="t(nameMap[type])"
    type="radio"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="list"
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
        <MultiSelect
          v-if="list[index]"
          v-model="list[index].value"
          class="
            w-full
            sm:w-auto
          "
          :options="multiSelectOptions"
          :placeholder="t('condition.selectPlaceholder', { name: t(nameMap[type]).toLowerCase() })"
        />
        <div class="flex gap-0.5">
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
