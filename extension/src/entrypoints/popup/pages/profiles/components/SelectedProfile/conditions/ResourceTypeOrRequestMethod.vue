<script setup lang="ts" generic="T extends ConditionType">
import type { GroupItem, GroupType } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import Button from "#/ui/button/Button.vue";
import MultiSelect from "#/ui/multi-select/MultiSelect.vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup } from "@/lib/group";
import { getProfileFilterGroupOpenStateId } from "@/lib/openState";

type FilterItem<V extends FilterValue> = GroupItem & {
  value: V[];
};

interface FilterGroup<V extends FilterValue> {
  type: GroupType;
  items: FilterItem<V>[];
}

const filterGroup = defineModel<FilterGroup<FilterValueMap[T]>>({
  required: true,
});

const { type } = defineProps<{
  type: T;
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();

interface FilterOption<V extends FilterValue> {
  value: V;
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
] as const satisfies readonly FilterOption<ResourceTypeValue>[];

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
] as const satisfies readonly FilterOption<RequestMethodValue>[];

const optionsMap: {
  [K in ConditionType]: readonly FilterOption<FilterValueMap[K]>[];
} = {
  resourceTypes: resourceTypeOptions,
  requestMethods: requestMethodsOptions,
  excludedResourceTypes: resourceTypeOptions,
  excludedRequestMethods: requestMethodsOptions,
};

const options = computed(() => optionsMap[type]);

const name = computed(() => {
  const nameMap = {
    resourceTypes: t("condition.resourceTypes.title"),
    excludedResourceTypes: t("condition.excludedResourceTypes.title"),
    requestMethods: t("condition.requestMethods.title"),
    excludedRequestMethods: t("condition.excludedRequestMethods.title"),
  } as const satisfies Record<ConditionType, string>;

  return nameMap[type];
});

function deleteGroup() {
  delete profilesStore.selectedProfile.filters[type];
}

function newField() {
  const newItem: FilterItem<FilterValueMap[T]> = {
    id: uuidv7(),
    enabled: true,
    value: [],
  };

  addItemToGroup(filterGroup.value.items, newItem, filterGroup.value.type);
}
</script>

<script lang="ts">
type ConditionType = "resourceTypes" | "requestMethods" | "excludedResourceTypes" | "excludedRequestMethods";
type ResourceTypeValue = `${Browser.declarativeNetRequest.ResourceType}`;
type RequestMethodValue = `${Browser.declarativeNetRequest.RequestMethod}`;
type FilterValue = ResourceTypeValue | RequestMethodValue;

interface FilterValueMap {
  resourceTypes: ResourceTypeValue;
  excludedResourceTypes: ResourceTypeValue;
  requestMethods: RequestMethodValue;
  excludedRequestMethods: RequestMethodValue;
}
</script>

<template>
  <Group
    :id="getProfileFilterGroupOpenStateId(profilesStore.selectedProfile.id, type)"
    v-model:list="filterGroup.items"
    :name
    :type="filterGroup.type"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="filterGroup.items"
        v-model:type="filterGroup.type"
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
          v-if="filterGroup.items[index]"
          v-model="filterGroup.items[index].value"
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
              filterGroup.items.splice(index, 1);
            }"
          >
            <span class="sr-only">{{ t("common.deleteHeaderMod") }}</span>
            <i class="i-lucide-x size-4" />
          </Button>
          <ActionsDropdown
            v-model:list="filterGroup.items"
            v-model:field="filterGroup.items[index]!"
            :index
          />
        </div>
      </div>
    </template>
  </Group>
</template>
