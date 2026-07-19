<script setup lang="ts">
import type { ActionKey } from "./actions";
import type { Profile } from "@/lib/schema";
import { useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import { Kbd, KbdGroup } from "#/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useCompactScreen } from "@/composables/useCompactScreen";
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
import ProfileActionsMenuItems from "./ProfileActionsMenuItems.vue";

const profile = defineModel<Profile>("profile", {
  required: true,
});

const { toggleShortcutKeys = [] } = defineProps<{
  toggleShortcutKeys?: string[];
}>();

const { t } = useI18n();

const isCompact = useCompactScreen();

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
          <TooltipContent side="bottom" class="flex items-center gap-2">
            <span>{{ action.label(profile) }}</span>
            <KbdGroup v-if="action.id === 'toggle'" class="z-50">
              <Kbd v-for="key in toggleShortcutKeys" :key>
                {{ key }}
              </Kbd>
            </KbdGroup>
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
        <ProfileActionsMenuItems
          :action-groups="isCompact ? compactActionGroups : moreActionGroups"
          menu-type="dropdown"
          :profile
          @open-change-rule-action-type="changeTypeDialogRef?.open()"
          @open-comments="commentsDialogRef?.open()"
          @open-priority="priorityDialogRef?.open()"
        />
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
