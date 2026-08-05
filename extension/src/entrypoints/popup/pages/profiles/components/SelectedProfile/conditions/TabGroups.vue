<script setup lang="ts">
import type { TabGroupBinding, TabGroupsFilterGroup, TabGroupsFilterItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { getCurrentTabGroupBinding } from "@/lib/currentTab";
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

const currentTabGroupBinding = ref<TabGroupBinding>();

async function refreshCurrentTabGroupBinding() {
  currentTabGroupBinding.value = await getCurrentTabGroupBinding();
  return currentTabGroupBinding.value;
}

function createTabGroupsFilterItem(value: TabGroupBinding[] = []) {
  return {
    id: uuidv7(),
    enabled: true,
    value,
  } satisfies TabGroupsFilterItem;
}

async function newField() {
  const binding = await refreshCurrentTabGroupBinding();
  addItemToGroup(
    filterGroup.value.items,
    createTabGroupsFilterItem(binding ? [binding] : []),
    filterGroup.value.type,
  );
}

async function addCurrentTabGroup(index: number) {
  const binding = await refreshCurrentTabGroupBinding();
  const item = filterGroup.value.items[index];
  if (!binding || !item) {
    return;
  }

  const existingIndex = item.value.findIndex(value => value.groupId === binding.groupId);
  if (existingIndex === -1) {
    item.value.push(binding);
  } else {
    item.value.splice(existingIndex, 1, binding);
  }
}

onMounted(refreshCurrentTabGroupBinding);
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  size="icon-xs"
                  variant="secondary"
                  :disabled="!currentTabGroupBinding"
                  @click="addCurrentTabGroup(index)"
                >
                  <i class="i-lucide-at-sign size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {{ t("condition.tabGroups.addCurrentTabGroup") }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
