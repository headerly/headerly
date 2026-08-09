<script setup lang="ts">
import type { TabIdsFilterGroup, TabIdsFilterItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { Button } from "#/ui/button";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getCurrentTabId } from "@/lib/currentTab";
import { addItemToGroup } from "@/lib/group";
import { getProfileFilterGroupOpenStateId } from "@/lib/openState";
import TabIdSelect from "../components/TabIdSelect.vue";

const filterGroup = defineModel<TabIdsFilterGroup>({ required: true });

const { filterType } = defineProps<{
  filterType: "tabIds" | "excludedTabIds";
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();

const field = computed(() => ({
  tabIds: {
    title: t("condition.tabIds.title"),
    documentationLink: "https://headerly.dev/reference/conditions/tabs",
  },
  excludedTabIds: {
    title: t("condition.excludedTabIds.title"),
    documentationLink: "https://headerly.dev/reference/conditions/tabs",
  },
}));

function deleteGroup() {
  delete profilesStore.selectedProfile.filters[filterType];
}

async function createTabIdsFilterItem() {
  const currentTabId = await getCurrentTabId();
  return {
    id: uuidv7(),
    enabled: true,
    value: currentTabId === undefined ? [] : [currentTabId],
  } satisfies TabIdsFilterItem;
}

async function newField() {
  addItemToGroup(filterGroup.value.items, await createTabIdsFilterItem(), filterGroup.value.type);
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
        :documentation-link="field[filterType].documentationLink"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <div class="flex min-w-0 flex-1 items-center gap-1">
        <TabIdSelect
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
