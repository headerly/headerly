<script setup lang="ts">
import type { Profile, ProfileGroup } from "@/lib/schema";
import { AnimatePresence, motion } from "motion-v";
import { useTemplateRef } from "vue";
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
  (e: "sortProfiles", event: { newIndex: number; oldIndex: number }): void;
  (e: "setRef", el: HTMLDivElement | null, profileId: string): void;
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

defineExpose({ openContextMenu });
</script>

<template>
  <div class="relative flex gap-1.5">
    <motion.div
      class="shrink-0 origin-top rounded-full"
      :style="{ backgroundColor: group.color }"
      :initial="false"
      :animate="open
        ? { width: 3, opacity: 1, marginLeft: -9, scaleY: 1 }
        : { width: 0, opacity: 0, marginLeft: -6, scaleY: 0 }"
      :transition="{ duration: 0.18, ease: 'easeOut' }"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <ProfileGroupContextMenu
        ref="contextMenu"
        :group
        :open
        :profiles
        @toggle-open="open = !open"
      />
      <AnimatePresence :initial="false">
        <motion.div
          v-if="open"
          key="profile-group-items"
          class="-mt-1 overflow-x-visible overflow-y-clip pt-1"
          :initial="{ height: 0, opacity: 0, y: -4 }"
          :animate="{ height: 'auto', opacity: 1, y: 0 }"
          :exit="{ height: 0, opacity: 0, y: -4 }"
          :transition="{ duration: 0.18, ease: 'easeOut' }"
        >
          <div ref="listContainer" class="flex flex-col gap-1">
            <div
              v-for="(profile, index) in profiles"
              :key="profile.id"
              :ref="(el) => emit('setRef', el as HTMLDivElement | null, profile.id)"
            >
              <ProfileListItem
                :index
                :profile
                layout="icon"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
