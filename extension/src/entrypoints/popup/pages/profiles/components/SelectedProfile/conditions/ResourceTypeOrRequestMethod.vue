<script setup lang="ts" generic="T extends ConditionType">
import type { GroupItem } from "@/lib/schema";
import { match } from "ts-pattern";
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

interface ResourceTypeOption {
  value: `${Browser.declarativeNetRequest.ResourceType}`;
  label: string;
}

const resourceTypeOptions = [
  { value: "csp_report", label: t("condition.resourceType.cspReport") },
  { value: "font", label: t("condition.resourceType.font") },
  { value: "image", label: t("condition.resourceType.image") },
  { value: "main_frame", label: t("condition.resourceType.mainFrame") },
  { value: "media", label: t("condition.resourceType.media") },
  { value: "object", label: t("condition.resourceType.object") },
  { value: "other", label: t("condition.resourceType.other") },
  { value: "ping", label: t("condition.resourceType.ping") },
  { value: "script", label: t("condition.resourceType.script") },
  { value: "stylesheet", label: t("condition.resourceType.stylesheet") },
  { value: "sub_frame", label: t("condition.resourceType.subFrame") },
  { value: "webbundle", label: t("condition.resourceType.webbundle") },
  { value: "websocket", label: t("condition.resourceType.websocket") },
  { value: "webtransport", label: t("condition.resourceType.webtransport") },
  { value: "xmlhttprequest", label: t("condition.resourceType.xmlhttprequest") },
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

const name = computed(() =>
  match(type as ConditionType)
    .with("resourceTypes", () => t("condition.resourceTypes.title"))
    .with("excludedResourceTypes", () => t("condition.excludedResourceTypes.title"))
    .with("requestMethods", () => t("condition.requestMethods.title"))
    .with("excludedRequestMethods", () => t("condition.excludedRequestMethods.title"))
    .exhaustive(),
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

<script lang="ts">
type ConditionType = "resourceTypes" | "requestMethods" | "excludedResourceTypes" | "excludedRequestMethods";
</script>

<template>
  <Group
    v-model:list="list"
    :name
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
          :options
          :placeholder="t('condition.selectPlaceholder', { name: name.toLowerCase() })"
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
