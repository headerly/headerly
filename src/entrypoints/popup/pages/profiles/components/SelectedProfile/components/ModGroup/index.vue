<script setup lang="ts">
import type { ActionType } from "#/stores/useProfilesStore";
import type { UUID } from "node:crypto";
import type { GroupType, HeaderMod } from "@/lib/storage";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { findHeaderModGroups, useProfilesStore } from "#/stores/useProfilesStore";
import { createMod } from "@/lib/storage";
import ModField from "./ModFieldWithActions.vue";

const { actionType, groupId } = defineProps<{
  actionType: ActionType;
  groupId: UUID;
}>();

const list = defineModel<HeaderMod[]>("list", {
  required: true,
});

const type = defineModel<GroupType>("type", {
  required: true,
});

const profilesStore = useProfilesStore();

function addNewField() {
  const mod = createMod({
    enabled: type.value === "checkbox",
  });
  list.value.push(mod);
}

function deleteGroup() {
  const groups = findHeaderModGroups(profilesStore.selectedProfile, actionType);
  const index = groups.findIndex(group => group.id === groupId);
  if (index !== -1) {
    groups.splice(index, 1);
  }
}
</script>

<template>
  <Group
    v-model:list="list"
    v-model:type="type"
    :name="actionType === 'request' ? 'Request Headers' : 'Response Headers'"
  >
    <template #name-after>
      <GroupActions
        v-model:list="list"
        v-model:type="type"
        @delete-group="deleteGroup"
        @new-field="addNewField"
      />
    </template>
    <template #item="{ index }">
      <ModField
        v-model:list="list"
        v-model:field="list[index]!"
        :action-type="actionType"
        :index="index"
        :length="list.length"
      />
    </template>
  </Group>
</template>
