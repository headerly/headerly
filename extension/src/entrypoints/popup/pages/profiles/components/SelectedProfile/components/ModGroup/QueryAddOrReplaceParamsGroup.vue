<script setup lang="ts">
import type { QueryKeyValueGroup } from "@/lib/schema";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { addItemToGroup, createRedirectQueryKeyValue } from "@/lib/utils";
import QueryKeyValueFieldWithActions from "./QueryKeyValueFieldWithActions.vue";

const group = defineModel<QueryKeyValueGroup>({
  required: true,
});

const emit = defineEmits<{
  (e: "deleteGroup"): void;
}>();

function addNewField() {
  addItemToGroup(group.value.items, createRedirectQueryKeyValue(), group.value.type);
}
</script>

<template>
  <Group
    v-model:list="group.items"
    :type="group.type"
    name="Transform Query Add/Replace Params"
    @delete-empty-group="emit('deleteGroup')"
  >
    <template #name-after>
      <GroupActions
        v-model:list="group.items"
        v-model:type="group.type"
        description="The list of query key-value pairs to be added or replaced."
        @delete-group="emit('deleteGroup')"
        @new-field="addNewField"
      />
    </template>
    <template #item="{ index }">
      <QueryKeyValueFieldWithActions
        v-model:list="group.items"
        v-model:field="group.items[index]!"
        :index
      />
    </template>
  </Group>
</template>
