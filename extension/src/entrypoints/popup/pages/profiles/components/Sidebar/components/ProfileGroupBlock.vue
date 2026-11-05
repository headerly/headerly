<script setup lang="ts">
import type { Profile, ProfileGroup } from "@/lib/schema";
import { useTemplateRef } from "vue";
import ProfileGroupFrame from "#/components/ProfileGroupFrame.vue";
import {
  PROFILE_GROUP_OPEN_STATES_STORAGE_KEY,
  useLocalStorageOpenState,
} from "@/composables/useLocalStorageOpenState";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";
import ProfileGroupContextMenu from "./ProfileGroupContextMenu.vue";
import ProfileListItem from "./ProfileListItem.vue";

const props = defineProps<{
  group: ProfileGroup;
  profiles: Profile[];
}>();

const emit = defineEmits<{
  (e: "collapsed"): void;
  (e: "sortProfiles", event: { newIndex: number; oldIndex: number }): void;
}>();

const open = useLocalStorageOpenState(
  props.group.id,
  PROFILE_GROUP_OPEN_STATES_STORAGE_KEY,
);
const contextMenu = useTemplateRef<InstanceType<typeof ProfileGroupContextMenu>>("contextMenu");
const listContainer = useTemplateRef<HTMLElement>("listContainer");

useSortableAndAutoAnimate({
  listContainer,
  list: props.profiles,
  onUpdate: event => emit("sortProfiles", event),
});

function openContextMenu() {
  contextMenu.value?.open();
}

function toggleOpen() {
  open.value = !open.value;
  if (!open.value) {
    emit("collapsed");
  }
}

defineExpose({ openContextMenu });
</script>

<template>
  <ProfileGroupFrame :group :open>
    <template #header>
      <ProfileGroupContextMenu ref="contextMenu" :group :open :profiles @toggle-open="toggleOpen" />
    </template>
    <div ref="listContainer" class="flex flex-col gap-1">
      <div
        v-for="(profile, index) in profiles"
        :key="profile.id"
        :data-profile-id="profile.id"
      >
        <ProfileListItem :index :profile layout="icon" />
      </div>
    </div>
  </ProfileGroupFrame>
</template>
