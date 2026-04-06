<script setup lang="ts">
import type { SyncCookieGroup } from "@/lib/schema";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup, createSyncCookie } from "@/lib/utils";
import CookieFieldWithActions from "./CookieFieldWithActions.vue";

const group = defineModel<SyncCookieGroup>({
  required: true,
});

const profilesStore = useProfilesStore();

function addNewField() {
  const newCookie = createSyncCookie();
  addItemToGroup(group.value.items, newCookie, group.value.type);
}

function deleteGroup() {
  const index = profilesStore.selectedProfile.syncCookieGroups?.findIndex(
    _group => _group.id === group.value.id,
  );
  if (index !== undefined && index !== -1) {
    profilesStore.selectedProfile.syncCookieGroups?.splice(index, 1);
  }
}
</script>

<template>
  <Group
    v-model:list="group.items"
    :type="group.type"
    name="Sync Cookies"
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
      <CookieFieldWithActions
        v-model:list="group.items"
        v-model:field="group.items[index]!"
        :index
      />
    </template>
  </Group>
</template>
