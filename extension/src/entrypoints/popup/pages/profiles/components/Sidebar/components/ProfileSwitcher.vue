<script setup lang="tsx">
import type { Profile, ProfileGroup, RuleActionType } from "@/lib/schema";
import { useEventListener } from "@vueuse/core";
import { computed, nextTick, useTemplateRef, watch } from "vue";
import {
  PROFILE_GROUP_OPEN_STATES_STORAGE_KEY,
  useLocalStorageOpenStateRecord,
} from "@/composables/useLocalStorageOpenState";
import { useScrollToProfile } from "@/composables/useScrollToProfile";
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import ProfileGroupBlock from "./ProfileGroupBlock.vue";
import { findProfileIdAfterGroupCollapse } from "./profileGroupSelection";
import ProfileListItem from "./ProfileListItem.vue";

const { defaultRuleActionType } = defineProps<{
  defaultRuleActionType: RuleActionType;
}>();

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
const profileGroupOpenStates = useLocalStorageOpenStateRecord(PROFILE_GROUP_OPEN_STATES_STORAGE_KEY);

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
const groupBlockRefs = new Map<string, InstanceType<typeof ProfileGroupBlock>>();
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

watch(
  () => profilesStore.newProfileGroupIdToEdit,
  async (groupId) => {
    if (!groupId)
      return;

    await nextTick();
    requestAnimationFrame(() => {
      const groupBlock = groupBlockRefs.get(groupId);
      if (!groupBlock)
        return;

      groupBlock.openContextMenu();
      profilesStore.newProfileGroupIdToEdit = undefined;
    });
  },
  { flush: "post" },
);

useSortableAndAutoAnimate({
  handle: "[data-profile-top-level-sort-handle]",
  listContainer,
  list: sidebarBlocks.value,
  onUpdate: handleSidebarBlocksSort,
});

function setGroupBlockRef(groupId: string, instance: InstanceType<typeof ProfileGroupBlock> | null) {
  if (instance) {
    groupBlockRefs.set(groupId, instance);
  } else {
    groupBlockRefs.delete(groupId);
  }
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

function reorderProfilesByIds(profileIds: string[]) {
  const profilesById = new Map(profilesStore.manager.profiles.map(profile => [profile.id, profile]));
  const seenProfileIds = new Set<string>();
  const reorderedProfiles = profileIds.flatMap((profileId) => {
    const profile = profilesById.get(profileId);
    if (!profile || seenProfileIds.has(profileId)) {
      return [];
    }

    seenProfileIds.add(profileId);
    return [profile];
  });
  const remainingProfiles = profilesStore.manager.profiles.filter(profile => !seenProfileIds.has(profile.id));
  profilesStore.manager.profiles.splice(0, profilesStore.manager.profiles.length, ...reorderedProfiles, ...remainingProfiles);
}

// Keep each group's displayed profile order consistent with the canonical flat profiles array
// by flattening the reordered sidebar blocks back into `manager.profiles`.
function handleSidebarBlocksSort(event: { newIndex: number; oldIndex: number }) {
  reorderProfilesByIds(flattenProfileIds(
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
  reorderProfilesByIds(flattenProfileIds(blocks));
}

async function handleGroupCollapsed(groupId: string) {
  const selectionBlocks = sidebarBlocks.value.map(block => block.type === "group"
    ? {
        type: block.type,
        groupId: block.group.id,
        profileIds: block.profiles.map(profile => profile.id),
      }
    : {
        type: block.type,
        profileId: block.profile.id,
      });
  const openGroupIds = new Set(
    profilesStore.profileGroups
      .filter(group => profileGroupOpenStates.value[group.id] ?? true)
      .map(group => group.id),
  );
  const nextSelectedProfileId = findProfileIdAfterGroupCollapse(selectionBlocks, groupId, openGroupIds);
  if (!nextSelectedProfileId) {
    await profilesStore.addProfile(defaultRuleActionType);
    return;
  }

  const selectedProfile = profilesStore.manager.profiles.find(
    profile => profile.id === profilesStore.manager.selectedProfileId,
  );
  if (selectedProfile?.groupId !== groupId) {
    return;
  }

  profilesStore.manager.selectedProfileId = nextSelectedProfileId;
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
        :ref="(instance) => setGroupBlockRef(
          block.group.id,
          instance as InstanceType<typeof ProfileGroupBlock> | null,
        )"
        :group="block.group"
        :profiles="block.profiles"
        @collapsed="handleGroupCollapsed(block.group.id)"
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
