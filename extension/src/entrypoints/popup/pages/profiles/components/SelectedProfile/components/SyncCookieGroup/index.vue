<script setup lang="ts">
import type { SyncCookieGroup } from "@/lib/type";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { createSyncCookie } from "@/lib/storage";
import CookieFieldWithActions from "./CookieFieldWithActions.vue";

const group = defineModel<SyncCookieGroup>({
  required: true,
});

const profilesStore = useProfilesStore();

function addNewField() {
  const newCookie = createSyncCookie({
    enabled: group.value.type === "checkbox",
  });
  group.value.items.push(newCookie);
}

function deleteGroup() {
  const index = profilesStore.selectedProfile.syncCookieGroups.findIndex(
    _group => _group.id === group.value.id,
  );
  if (index !== -1) {
    profilesStore.selectedProfile.syncCookieGroups.splice(index, 1);
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
