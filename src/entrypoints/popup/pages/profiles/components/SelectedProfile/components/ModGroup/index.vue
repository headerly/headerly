<script setup lang="ts">
import type { ActionType } from "#/stores/useProfilesStore";
import type { HeaderModGroup } from "@/lib/type";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { findHeaderModGroups, useProfilesStore } from "#/stores/useProfilesStore";
import { createMod } from "@/lib/storage";
import ModField from "./ModFieldWithActions.vue";

const { actionType } = defineProps<{
  actionType: ActionType;
}>();

const group = defineModel<HeaderModGroup>({
  required: true,
});

const profilesStore = useProfilesStore();

function addNewField() {
  const mod = createMod({
    enabled: group.value.type === "checkbox",
  });
  group.value.items.push(mod);
}

function deleteGroup() {
  const groups = findHeaderModGroups(profilesStore.selectedProfile, actionType);
  const index = groups.findIndex(_group => _group.id === group.value.id);
  if (index !== -1) {
    groups.splice(index, 1);
  }
}
</script>

<template>
  <Group
    v-model:list="group.items"
    :type="group.type"
    :name="actionType === 'request' ? 'Request Headers' : 'Response Headers'"
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
        :action-type="actionType"
        :index="index"
      />
    </template>
  </Group>
</template>
