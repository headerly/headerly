<script setup lang="ts">
import type { HeaderModGroup } from "@/lib/schema";
import type { ActionType } from "@/lib/types";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { findHeaderModGroups, useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup, createMod } from "@/lib/utils";
import ModField from "./ModFieldWithActions.vue";

const group = defineModel<HeaderModGroup>({
  required: true,
});

const { actionType } = defineProps<{
  actionType: ActionType;
}>();

const profilesStore = useProfilesStore();

function addNewField() {
  const mod = createMod();
  addItemToGroup(group.value.items, mod, group.value.type);
}

function deleteGroup() {
  const groups = findHeaderModGroups(profilesStore.selectedProfile, actionType);
  if (!groups)
    return;
  const index = groups.findIndex(_group => _group.id === group.value.id);
  if (index !== -1) {
    groups.splice(index, 1);
    if (groups.length === 0) {
      if (actionType === "request") {
        delete profilesStore.selectedProfile.requestHeaderModGroups;
      } else {
        delete profilesStore.selectedProfile.responseHeaderModGroups;
      }
    }
  }
}
</script>

<template>
  <Group
    v-model:list="group.items"
    :type="group.type"
    :name="actionType === 'request' ? 'Request Headers' : 'Response Headers'"
    @delete-empty-group="deleteGroup"
  >
    <template #name-after>
      <GroupActions
        v-model:list="group.items"
        v-model:type="group.type"
        @delete-group="deleteGroup"
        @new-field="addNewField"
      />
    </template>
    <template #item="{ index }">
      <ModField
        v-model:list="group.items"
        v-model:field="group.items[index]!"
        :action-type
        :index
      />
    </template>
  </Group>
</template>
