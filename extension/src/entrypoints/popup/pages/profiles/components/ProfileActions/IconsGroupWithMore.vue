<script setup lang="ts">
import type { ActionKey } from "./actions";
import type { Profile } from "@/lib/schema";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import ProfileGroupDisplayName from "#/pages/profiles/components/ProfileGroupDisplayName.vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useCompactScreen } from "@/composables/useCompactScreen";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { cn } from "@/lib/utils";
import {
  handleProfileRuleActionTypeChanged,
  profileActionIdGroups,
  profileMoreActionIdGroups,
  transformIdsToActions,
  useProfileActions,
} from "./actions";
import ChangeTypeDialog from "./ChangeTypeDialog.vue";
import PriorityDialog from "./PriorityDialog.vue";

const profile = defineModel<Profile>("profile", {
  required: true,
});

const { t } = useI18n();
const profilesStore = useProfilesStore();

const isCompact = useCompactScreen();
const isProfileInGroup = computed(() => profilesStore.getProfileGroup(profile.value.groupId) !== undefined);
const profilesByGroupId = computed(() => new Map(
  profilesStore.profileGroups.map((group) => {
    const profiles = profilesStore.manager.profiles.filter(profile => profile.groupId === group.id);
    return [group.id, profiles];
  }),
));

const actions = useProfileActions();
const mainActionIds = ["toggle"] as const satisfies ActionKey[];
const mainActions = actions.filter(action => mainActionIds.includes(action.id));

const moreActionGroups = transformIdsToActions(profileMoreActionIdGroups);
const compactActionGroups = transformIdsToActions(profileActionIdGroups);

const commentsDialogRef = useTemplateRef("commentsDialogRef");
const priorityDialogRef = useTemplateRef("priorityDialogRef");
const changeTypeDialogRef = useTemplateRef("changeTypeDialogRef");

async function handleChangeType() {
  await handleProfileRuleActionTypeChanged(profile.value);
}
</script>

<template>
  <div class="flex items-center gap-1">
    <template v-if="!isCompact">
      <TooltipProvider v-for="action in mainActions" :key="action.id">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              size="icon-sm"
              :class="cn(
                action.id === 'toggle' && !profile.enabled && (
                  'bg-primary! text-primary-foreground!'
                ),
              )"
              @click="action.onClick(profile, {
                openComments: () => commentsDialogRef?.open(),
                openPriority: () => priorityDialogRef?.open(),
                openChangeRuleActionType: () => changeTypeDialogRef?.open(),
              })"
            >
              <i
                class="size-4"
                :class="action.icon?.(profile)"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ action.label(profile) }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <slot name="after-main" />
    </template>
    <!-- Keep slot mounted on compact so dialogs/event buses stay active -->
    <div v-else class="hidden">
      <slot name="after-main" />
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="secondary"
          size="icon-sm"
        >
          <i class="i-lucide-ellipsis-vertical size-4" />
          <span class="sr-only">{{ t("profile.actions.openSecondaryOperations") }}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        class="min-w-40"
      >
        <template v-if="isCompact && $slots['compact-extra']">
          <slot name="compact-extra" />
          <DropdownMenuSeparator />
        </template>
        <template v-for="(actionsOrSeparator, index) in (isCompact ? compactActionGroups : moreActionGroups)" :key="index">
          <DropdownMenuSeparator v-if="actionsOrSeparator === 'separator'" />
          <DropdownMenuGroup
            v-else
          >
            <DropdownMenuItem
              v-for="action in actionsOrSeparator"
              :key="action.id"
              :variant="action.variant"
              @click="action.onClick(profile, {
                openComments: () => commentsDialogRef?.open(),
                openPriority: () => priorityDialogRef?.open(),
                openChangeRuleActionType: () => changeTypeDialogRef?.open(),
              })"
            >
              <span>{{ action.label(profile) }}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <template v-if="index === 0">
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {{ t("profile.actions.addToGroup") }}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent class="min-w-44">
                  <DropdownMenuItem
                    class="pl-6.5"
                    @click="profilesStore.addProfileToNewGroup(profile.id)"
                  >
                    {{ t("profile.actions.createNewGroup") }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator v-if="profilesStore.profileGroups.length > 0" />
                  <DropdownMenuItem
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
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                v-if="isProfileInGroup"
                @click="profilesStore.removeProfileFromGroup(profile.id)"
              >
                {{ t("profile.actions.removeFromGroup") }}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </template>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>

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
  </div>
</template>
