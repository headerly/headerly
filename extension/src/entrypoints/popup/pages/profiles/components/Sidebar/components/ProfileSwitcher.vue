<script setup lang="tsx">
import type { Profile, ProfileGroup } from "@/lib/schema";
import { useEventListener } from "@vueuse/core";
import { computed, ref, useTemplateRef, watch } from "vue";
import { useScrollToProfile } from "@/composables/useScrollToProfile";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import ProfileGroupBlock from "./ProfileGroupBlock.vue";
import ProfileListItem from "./ProfileListItem.vue";

interface ProfileBlock {
  id: string;
  profile: Profile;
  type: "profile";
}

interface GroupBlock {
  group: ProfileGroup;
  id: string;
  profiles: Profile[];
  type: "group";
}

type ProfileSidebarBlock = ProfileBlock | GroupBlock;

const profilesStore = useProfilesStore();

const {
  setRef,
  scrollToProfile,
} = useScrollToProfile({
  scrollTargetIdOnMounted: profilesStore.manager.selectedProfileId,
});

watch(
  () => profilesStore.manager.selectedProfileId,
  () => scrollToProfile(profilesStore.manager.selectedProfileId, "smooth"),
  // Wait for DOM to be updated, otherwise the latest DOM element cannot be accessed.
  { flush: "post" },
);

function handleSwitchProfileShortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key >= "1" && event.key <= "9") {
    event.preventDefault();
    const index = Number(event.key) - 1;
    const profiles = profilesStore.manager.profiles;
    if (index < profiles.length) {
      const profile = profiles[index]!;
      profilesStore.manager.selectedProfileId = profile.id;
    }
  }
}

useEventListener(window, "keydown", handleSwitchProfileShortcut);
const listContainer = useTemplateRef<HTMLElement>("listContainer");
const collapsedGroupIds = ref(new Set<string>());
const profileGroupsById = computed(() => new Map(profilesStore.profileGroups.map(group => [group.id, group])));
const sidebarBlocks = computed<ProfileSidebarBlock[]>(() => {
  const addedGroupIds = new Set<string>();
  return profilesStore.manager.profiles.flatMap((profile): ProfileSidebarBlock[] => {
    let group: ProfileGroup | undefined;
    if (profile.groupId) {
      group = profileGroupsById.value.get(profile.groupId);
    }
    if (!group) {
      return [{
        id: profile.id,
        profile,
        type: "profile",
      }];
    }

    if (addedGroupIds.has(group.id)) {
      return [];
    }

    addedGroupIds.add(group.id);
    return [{
      group,
      id: group.id,
      profiles: profilesStore.manager.profiles.filter(candidate => candidate.groupId === group.id),
      type: "group",
    }];
  });
});

useSortableAndAutoAnimate({
  handle: "[data-profile-top-level-sort-handle]",
  listContainer,
  list: sidebarBlocks.value,
  onUpdate: handleSidebarBlocksSort,
});

function toggleGroup(groupId: string) {
  if (collapsedGroupIds.value.has(groupId)) {
    collapsedGroupIds.value.delete(groupId);
  } else {
    collapsedGroupIds.value.add(groupId);
  }
  collapsedGroupIds.value = new Set(collapsedGroupIds.value);
}

function moveItem<T>(items: T[], oldIndex: number, newIndex: number) {
  if (oldIndex < 0 || oldIndex >= items.length || newIndex < 0 || newIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(oldIndex, 1);
  nextItems.splice(newIndex, 0, movedItem!);
  return nextItems;
}

function flattenProfileIds(
  blocks = sidebarBlocks.value,
) {
  return blocks.flatMap((block) => {
    if (block.type === "profile") {
      return [block.profile.id];
    }

    return block.profiles.map(profile => profile.id);
  });
}

function handleSidebarBlocksSort(event: { newIndex: number; oldIndex: number }) {
  profilesStore.reorderProfilesByIds(flattenProfileIds(
    moveItem(sidebarBlocks.value, event.oldIndex, event.newIndex),
  ));
}

function handleGroupProfilesSort(groupId: string, event: { newIndex: number; oldIndex: number }) {
  const blocks = sidebarBlocks.value.map((block) => {
    if (block.type !== "group" || block.group.id !== groupId) {
      return block;
    }

    return {
      ...block,
      profiles: moveItem(block.profiles, event.oldIndex, event.newIndex),
    };
  });
  profilesStore.reorderProfilesByIds(flattenProfileIds(blocks));
}
</script>

<template>
  <div
    ref="listContainer"
    class="
      flex flex-col gap-1 overflow-y-auto px-2 py-1.25 [scrollbar-width:none]
    "
  >
    <div
      v-for="(block, index) in sidebarBlocks"
      :key="block.id"
    >
      <ProfileGroupBlock
        v-if="block.type === 'group'"
        :group="block.group"
        :profiles="block.profiles"
        :collapsed="collapsedGroupIds.has(block.group.id)"
        @toggle="toggleGroup(block.group.id)"
        @set-ref="setRef"
        @sort-profiles="handleGroupProfilesSort(block.group.id, $event)"
      />
      <div
        v-else
        :ref="(el) => setRef(el as HTMLDivElement | null, block.profile.id)"
        data-profile-top-level-sort-handle
      >
        <ProfileListItem
          :index
          :profile="block.profile"
          layout="icon"
        />
      </div>
    </div>
  </div>
</template>
