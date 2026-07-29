<script setup lang="ts">
import type { TabGroupsFilterGroup, TabGroupsFilterItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { Button } from "#/ui/button";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup } from "@/lib/group";
import { getProfileFilterGroupOpenStateId } from "@/lib/openState";
import TabGroupSelect from "../components/TabGroupSelect.vue";

const filterGroup = defineModel<TabGroupsFilterGroup>({ required: true });

const { filterType } = defineProps<{
  filterType: "tabGroups" | "excludedTabGroups";
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();

const field = computed(() => ({
  tabGroups: {
    title: t("condition.tabGroups.title"),
    description: t("condition.tabGroups.description"),
  },
  excludedTabGroups: {
    title: t("condition.excludedTabGroups.title"),
    description: t("condition.excludedTabGroups.description"),
  },
}));

function deleteGroup() {
  delete profilesStore.selectedProfile.filters[filterType];
}

function createTabGroupsFilterItem() {
  return {
    id: uuidv7(),
    enabled: true,
    value: [],
  } satisfies TabGroupsFilterItem;
}

function newField() {
  addItemToGroup(filterGroup.value.items, createTabGroupsFilterItem(), filterGroup.value.type);
}
</script>

<template>
  <Group
    :id="getProfileFilterGroupOpenStateId(profilesStore.selectedProfile.id, filterType)"
    v-model:list="filterGroup.items"
    :name="field[filterType].title"
    :type="filterGroup.type"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="filterGroup.items"
        v-model:type="filterGroup.type"
        :description="field[filterType].description"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <div class="flex min-w-0 flex-1 items-center gap-1">
        <TabGroupSelect
          v-if="filterGroup.items[index]"
          v-model="filterGroup.items[index].value"
        />
        <div class="flex gap-0.5">
          <Button
            size="icon-xs"
            variant="secondary"
            @click="filterGroup.items.splice(index, 1)"
          >
            <span class="sr-only">{{ t("common.deleteCondition") }}</span>
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
