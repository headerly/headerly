<script setup lang="ts">
import type { HeaderModGroup } from "@/lib/schema";
import type { ActionType } from "@/lib/types";
import { useI18n } from "vue-i18n";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { findHeaderModGroups } from "#/pages/profiles/utils";
import { useRecentHeaderNames } from "@/composables/useRecentHeaderNames";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { addItemToGroup } from "@/lib/group";
import { createHeaderMod } from "@/lib/profileFactory";
import RecentHeaderNames from "./RecentHeaderNames.vue";
import RequestModFieldWithActions from "./RequestModFieldWithActions.vue";

const group = defineModel<HeaderModGroup>({
  required: true,
});

const { actionType } = defineProps<{
  actionType: ActionType;
}>();

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();
const {
  recentHeaderNames,
  addRecentHeaderName,
  removeRecentHeaderName,
} = useRecentHeaderNames(actionType);

function addNewField(name = "") {
  const mod = createHeaderMod({ name });
  addItemToGroup(group.value.items, mod, group.value.type);
  addRecentHeaderName(name);
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
    :id="group.id"
    v-model:list="group.items"
    :type="group.type"
    :name="actionType === 'request' ? t('headerMod.requestHeaders') : t('headerMod.responseHeaders')"
    @delete-empty-group="deleteGroup"
  >
    <template #group-actions>
      <GroupActions
        v-model:list="group.items"
        v-model:type="group.type"
        @delete-group="deleteGroup"
        @new-field="addNewField"
      />
    </template>
    <template #items-before>
      <RecentHeaderNames
        v-if="!settingsStore.hideRecentlyAdded"
        :names="recentHeaderNames"
        class="mb-2"
        @add="addNewField"
        @remove="removeRecentHeaderName"
      />
    </template>
    <template #item="{ index }">
      <RequestModFieldWithActions
        v-model:list="group.items"
        v-model:field="group.items[index]!"
        :action-type
        :index
        @name-committed="addRecentHeaderName"
      />
    </template>
  </Group>
</template>
