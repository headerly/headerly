<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
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

const props = defineProps<{
  profile: Profile;
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();
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
      <ContextMenuLabel class="max-w-36 truncate">
        {{ profile.name }}
      </ContextMenuLabel>
      <template v-for="(actionsOrSeparator, index) in actionGroups" :key="index">
        <ContextMenuSeparator v-if="actionsOrSeparator === 'separator'" />
        <ContextMenuGroup v-else>
          <ContextMenuItem
            v-for="action in actionsOrSeparator"
            :key="action.id"
            :variant="action.variant"
            @click="action.onClick(profile, {
              openComments: () => commentsDialogRef?.open(),
              openPriority: () => priorityDialogRef?.open(),
              openChangeRuleActionType: () => changeTypeDialogRef?.open(),
            })"
          >
            {{ action.label(profile) }}
          </ContextMenuItem>
          <ContextMenuSub v-if="index === 0">
            <ContextMenuSubTrigger>
              {{ t("profile.actions.addToGroup") }}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent class="min-w-44">
              <ContextMenuItem
                v-for="group in profilesStore.profileGroups"
                :key="group.id"
                @click="profilesStore.addProfileToGroup(profile.id, group.id)"
              >
                <span
                  class="size-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: group.color }"
                />
                <span class="truncate">{{ group.name }}</span>
              </ContextMenuItem>
              <ContextMenuSeparator v-if="profilesStore.profileGroups.length > 0" />
              <ContextMenuItem @click="profilesStore.addProfileToNewGroup(profile.id)">
                <i class="i-lucide-folder-plus size-4" />
                {{ t("profile.actions.createNewGroup") }}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem
            v-if="index === 0 && profile.groupId"
            @click="profilesStore.removeProfileFromGroup(profile.id)"
          >
            {{ t("profile.actions.ungroup") }}
          </ContextMenuItem>
        </ContextMenuGroup>
      </template>
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
