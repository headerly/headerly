<script setup lang="ts">
import type { SyncCookieGroup } from "@/lib/schema";
import { useI18n } from "vue-i18n";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { addItemToGroup } from "@/lib/group";
import { createSyncCookie } from "@/lib/profileFactory";
import CookieFieldWithActions from "./CookieFieldWithActions.vue";

const group = defineModel<SyncCookieGroup>({
  required: true,
});

const profilesStore = useProfilesStore();
const { t } = useI18n();

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
    if (profilesStore.selectedProfile.syncCookieGroups?.length === 0) {
      delete profilesStore.selectedProfile.syncCookieGroups;
    }
  }
}
</script>

<template>
  <Group
    :id="group.id"
    v-model:list="group.items"
    :type="group.type"
    :name="t('syncCookie.title')"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="group.items"
        v-model:type="group.type"
        documentation-link="https://headerly.dev/guide/sync-cookies-feature"
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
