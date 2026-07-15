<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import ProfileGroupDisplayName from "#/pages/profiles/components/ProfileGroupDisplayName.vue";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
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
const isProfileInGroup = computed(() => profilesStore.getProfileGroup(profile.value.groupId) !== undefined);
const profilesByGroupId = computed(() => new Map(
  profilesStore.profileGroups.map((group) => {
    const profiles = profilesStore.manager.profiles.filter(profile => profile.groupId === group.id);
    return [group.id, profiles];
  }),
));

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
        </ContextMenuGroup>
        <template v-if="index === 0">
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                {{ t("profile.actions.addToGroup") }}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent class="min-w-44">
                <ContextMenuItem
                  class="pl-6.5"
                  @click="profilesStore.addProfileToNewGroup(profile.id)"
                >
                  {{ t("profile.actions.createNewGroup") }}
                </ContextMenuItem>
                <ContextMenuSeparator v-if="profilesStore.profileGroups.length > 0" />
                <ContextMenuItem
                  v-for="group in profilesStore.profileGroups"
                  :key="group.id"
                  @click="profilesStore.addProfileToGroup(profile.id, group.id)"
                >
                  <span
                    class="size-2.5 shrink-0 rounded-full"
                    :style="{ backgroundColor: group.color }"
                  />
                  <ProfileGroupDisplayName
                    :group
                    :profiles="profilesByGroupId.get(group.id) ?? []"
                  />
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              v-if="isProfileInGroup"
              @click="profilesStore.removeProfileFromGroup(profile.id)"
            >
              {{ t("profile.actions.removeFromGroup") }}
            </ContextMenuItem>
          </ContextMenuGroup>
        </template>
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
