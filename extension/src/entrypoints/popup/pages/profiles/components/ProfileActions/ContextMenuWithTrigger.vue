<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { computed, useTemplateRef } from "vue";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "#/ui/context-menu";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import {
  handleProfileRuleActionTypeChanged,
  profileActionIdGroups,
  transformIdsToActions,
} from "./actions";
import ChangeTypeDialog from "./ChangeTypeDialog.vue";
import PriorityDialog from "./PriorityDialog.vue";
import ProfileActionsMenuItems from "./ProfileActionsMenuItems.vue";

const props = defineProps<{
  profile: Profile;
}>();

const profilesStore = useProfilesStore();
const profile = computed(() => profilesStore.manager.profiles.find(p => p.id === props.profile.id)!);

const actionGroups = transformIdsToActions(profileActionIdGroups);

const commentsDialogRef = useTemplateRef("commentsDialogRef");
const priorityDialogRef = useTemplateRef("priorityDialogRef");
const changeTypeDialogRef = useTemplateRef("changeTypeDialogRef");

async function handleChangeType() {
  await handleProfileRuleActionTypeChanged(profile.value);
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent
      :collision-padding="32"
      class="min-w-40"
    >
      <ProfileActionsMenuItems
        :action-groups
        menu-type="context"
        :profile
        @open-change-rule-action-type="changeTypeDialogRef?.open()"
        @open-comments="commentsDialogRef?.open()"
        @open-priority="priorityDialogRef?.open()"
      />
    </ContextMenuContent>
    <CommentsDialog
      ref="commentsDialogRef"
      v-model="profile.comments"
    />
    <PriorityDialog
      ref="priorityDialogRef"
      v-model="profile.priority"
    />
    <ChangeTypeDialog
      ref="changeTypeDialogRef"
      v-model:rule-action-type="profile.ruleActionType"
      @changed="handleChangeType"
    />
  </ContextMenu>
</template>
