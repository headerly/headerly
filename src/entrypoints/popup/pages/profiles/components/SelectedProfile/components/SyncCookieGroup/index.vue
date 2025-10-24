<script setup lang="ts">
import type { GroupType } from "@/lib/storage";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { computed } from "vue";

const { groupId, groupType } = defineProps<{
  groupId: string;
  groupType: GroupType;
}>();

const profilesStore = useProfilesStore();

const cookies = computed(() => profilesStore.selectedProfile.syncCookieGroups.find(group => group.id === groupId)?.cookies || []);
</script>

<template>
  <Group
    v-model="cookies"
    name="Sync Cookies"
    :type="groupType"
  />
</template>
