<script setup lang="ts" generic="T extends 'resourceTypes' | 'requestMethods' | 'excludedResourceTypes' | 'excludedRequestMethods'">
import type { GroupItem } from "@/lib/type";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import Button from "#/ui/button/Button.vue";
import MultiSelect from "#/ui/multi-select/MultiSelect.vue";
import { computed } from "vue";

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

const nameMap = {
  resourceTypes: "Resource Types",
  excludedResourceTypes: "Excluded Resource Types",
  requestMethods: "Request Methods",
  excludedRequestMethods: "Excluded Request Methods",
};

interface ResourceTypeOption {
  value: `${Browser.declarativeNetRequest.ResourceType}`;
  label: string;
}

const resourceTypeOptions = [
  { value: "csp_report", label: "CSP Report" },
  { value: "font", label: "Font" },
  { value: "image", label: "Image" },
  { value: "main_frame", label: "Main Frame" },
  { value: "media", label: "Media" },
  { value: "object", label: "Object" },
  { value: "other", label: "Other" },
  { value: "ping", label: "Ping" },
  { value: "script", label: "Script" },
  { value: "stylesheet", label: "Stylesheet" },
  { value: "sub_frame", label: "Sub Frame" },
  { value: "webbundle", label: "WebBundle" },
  { value: "websocket", label: "WebSocket" },
  { value: "webtransport", label: "WebTransport" },
  { value: "xmlhttprequest", label: "XMLHttpRequest" },
] as const satisfies ResourceTypeOption[];

interface RequestMethodOption {
  value: `${Browser.declarativeNetRequest.RequestMethod}`;
  label: string;
}

const requestMethodsOptions = [
  { value: "connect", label: "CONNECT" },
  { value: "delete", label: "DELETE" },
  { value: "get", label: "GET" },
  { value: "head", label: "HEAD" },
  { value: "options", label: "OPTIONS" },
  { value: "other", label: "OTHER" },
  { value: "patch", label: "PATCH" },
  { value: "post", label: "POST" },
  { value: "put", label: "PUT" },
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
  options.value.map(option => ({
    value: option.value,
    label: option.label,
    disabled: false,
  })),
);

function deleteGroup() {
  list.value = list.value.filter(item => !item.enabled);
}

function newField() {
  const newItem = {
    id: crypto.randomUUID(),
    enabled: false,
    comments: "",
    value: [],
  } as unknown as FilterItemType<T>;

  list.value.push(newItem);
}
</script>

<template>
  <Group v-model:list="list" :name="nameMap[type]" type="radio">
    <template #name-after>
      <GroupActions
        v-model:list="list"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <MultiSelect
        v-if="list[index]"
        v-model="list[index].value"
        :options="multiSelectOptions"
        :placeholder="`Select ${nameMap[type].toLowerCase()}...`"
      />
      <div class="ml-1 flex gap-0.5">
        <Button
          variant="secondary"
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
