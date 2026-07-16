<script setup lang="tsx">
import type { TabIdFilterItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { Button } from "#/ui/button";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "#/ui/number-field";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup, getCurrentTabId } from "@/lib/utils";

const list = defineModel<TabIdFilterItem[]>({
  required: true,
});

const { filterType } = defineProps<{
  filterType: "tabIds" | "excludedTabIds";
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();
const TAB_ID_NONE = browser.tabs.TAB_ID_NONE;

const field = computed(() => ({
  tabIds: {
    title: t("condition.tabIds.title"),
    description: [
      t("condition.tabIds.description"),
      t("condition.tabIds.sessionOnly"),
      t("condition.tabIds.noTabId"),
    ],
  },
  excludedTabIds: {
    title: t("condition.excludedTabIds.title"),
    description: [
      t("condition.excludedTabIds.description"),
      t("condition.tabIds.sessionOnly"),
      t("condition.tabIds.noTabId"),
    ],
  },
}));

function deleteGroup() {
  delete profilesStore.selectedProfile.filters[filterType];
}

async function createTabIdItem() {
  return {
    id: uuidv7(),
    enabled: true,
    value: await getCurrentTabId() ?? browser.tabs.TAB_ID_NONE,
  } satisfies TabIdFilterItem;
}

async function newField() {
  addItemToGroup(list.value, await createTabIdItem(), "checkbox");
}

async function useCurrentTabId(index: number) {
  list.value[index]!.value = await getCurrentTabId() ?? browser.tabs.TAB_ID_NONE;
}
</script>

<template>
  <Group
    :id="`${profilesStore.selectedProfile.id}:${filterType}`"
    v-model:list="list"
    :name="field[filterType].title"
    type="checkbox"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="list"
        :description="field[filterType].description"
        documentation-link="https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#type-RuleCondition"
        @delete-group="deleteGroup"
        @new-field="newField"
      />
    </template>
    <template #item="{ index }">
      <div class="flex flex-1 items-center gap-1">
        <NumberField
          v-model="list[index]!.value"
          :min="TAB_ID_NONE"
          :max="2 ** 31 - 1"
          class="w-full"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
        <div class="flex gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  @click="useCurrentTabId(index)"
                >
                  <i class="i-lucide-panels-top-left size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {{ t("condition.tabIds.useCurrentTabId") }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="secondary"
            size="icon-xs"
            @click="list.splice(index, 1)"
          >
            <span class="sr-only">{{ t("common.deleteCondition") }}</span>
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
