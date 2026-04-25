<script setup lang="ts">
import type { ActionKey } from "./actions";
import type { Profile } from "@/lib/schema";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/ui/context-menu";
import { match } from "ts-pattern";
import { uuidv7 } from "uuidv7";
import { computed, useTemplateRef } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { cn, createMod } from "@/lib/utils";
import { transformIdsToActions } from "./actions";
import ChangeTypeDialog from "./ChangeTypeDialog.vue";
import PriorityDialog from "./PriorityDialog.vue";

const props = defineProps<{
  profile: Profile;
}>();

const profilesStore = useProfilesStore();
const profile = computed(() => profilesStore.manager.profiles.find(p => p.id === props.profile.id)!);

const actionIdGroups = [
  ["toggle", "duplicate", "delete", "comments", "rulePriority", "ruleActionType"],
  "separator",
  ["copyJson"],
] as const satisfies (ActionKey[] | "separator")[];
const actionGroups = transformIdsToActions(actionIdGroups);

const commentsDialogRef = useTemplateRef("commentsDialogRef");
const priorityDialogRef = useTemplateRef("priorityDialogRef");
const changeTypeDialogRef = useTemplateRef("changeTypeDialogRef");

function handleChangeType() {
  const p = profile.value;
  match(p.ruleActionType)
    .with("block", "allow", "upgradeScheme", "allowAllRequests", () => {
      delete p.requestHeaderModGroups;
      delete p.responseHeaderModGroups;
      delete p.syncCookieGroups;
    })
    .with("modifyHeaders", () => {
      p.requestHeaderModGroups ??= [{
        id: uuidv7(),
        type: "checkbox",
        items: [createMod()],
      }];
    })
    .with("redirect", () => {
      delete p.requestHeaderModGroups;
      delete p.responseHeaderModGroups;
      delete p.syncCookieGroups;
    })
    .exhaustive();

  // Ensure there is at least one filter
  if (Object.keys(p.filters).length === 0) {
    p.filters.urlFilter = [{
      id: uuidv7(),
      enabled: true,
      value: "",
      comments: "",
    }];
  }
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
            :class="cn(
              action.variant === 'destructive' && 'text-destructive!',
            )"
            @click="action.onClick(profile, {
              openComments: () => commentsDialogRef?.open(),
              openPriority: () => priorityDialogRef?.open(),
              openChangeRuleActionType: () => changeTypeDialogRef?.open(),
            })"
          >
            {{ action.label(profile) }}
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
