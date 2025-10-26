<script setup lang="ts">
import type { UUID } from "node:crypto";
import type { GroupType, SyncCookie } from "@/lib/storage";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { createSyncCookie } from "@/lib/storage";
import CookieFieldWithActions from "./CookieFieldWithActions.vue";

const { groupId } = defineProps<{
  groupId: UUID;
}>();

const list = defineModel<SyncCookie[]>("list", {
  required: true,
});

const type = defineModel<GroupType>("type", {
  required: true,
});

const profilesStore = useProfilesStore();

function addNewField() {
  const newCookie = createSyncCookie({
    enabled: type.value === "checkbox",
  });
  list.value.push(newCookie);
}

function deleteGroup() {
  const index = profilesStore.selectedProfile.syncCookieGroups.findIndex(
    group => group.id === groupId,
  );
  if (index !== -1) {
    profilesStore.selectedProfile.syncCookieGroups.splice(index, 1);
  }
}
</script>

<template>
  <Group
    v-model:list="list"
    v-model:type="type"
    name="Sync Cookies"
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
      <CookieFieldWithActions
        v-model:list="list"
        v-model:field="list[index]!"
        :index
      />
    </template>
  </Group>
</template>
