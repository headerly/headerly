<script setup lang="ts">
import type { ActionKey } from "./actions";
import type { Profile } from "@/lib/schema";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useTemplateRef } from "vue";
import { cn } from "@/lib/utils";
import { transformIdsToActions, useProfileActions } from "./actions";
import PriorityDialog from "./PriorityDialog.vue";

const profile = defineModel<Profile>("profile", {
  required: true,
});

const actions = useProfileActions();
const mainActionIds = ["toggle", "delete"] as const satisfies ActionKey[];
const mainActions = actions.filter(action => mainActionIds.includes(action.id));

const moreActionIdGroups = [
  ["duplicate", "comments", "rulePriority"],
  "separator",
  ["copyJson", "copyId"],
  "separator",
  ["moveUp", "moveDown"],
] as const satisfies (ActionKey[] | "separator")[];
const moreActionGroups = transformIdsToActions(moreActionIdGroups);

const commentsDialogRef = useTemplateRef("commentsDialogRef");
const priorityDialogRef = useTemplateRef("priorityDialogRef");
</script>

<template>
  <div class="flex items-center gap-1">
    <TooltipProvider v-for="action in mainActions" :key="action.id">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="secondary"
            size="icon-sm"
            :class="cn(
              action.variant === 'destructive' && 'text-destructive!',
              action.id === 'toggle' && !profile.enabled && (
                'bg-primary! text-primary-foreground!'
              ),
            )"
            :disabled="action.disabled?.(profile)"
            @click="action.onClick(profile, {
              openComments: () => commentsDialogRef?.open(),
              openPriority: () => priorityDialogRef?.open(),
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

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="secondary"
          size="icon-sm"
        >
          <i class="i-lucide-ellipsis-vertical size-4" />
          <span class="sr-only">Open Secondary Operations Dropdown</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        class="min-w-40"
      >
        <template v-for="(actionsOrSeparator, index) in moreActionGroups" :key="index">
          <DropdownMenuSeparator v-if="actionsOrSeparator === 'separator'" />
          <DropdownMenuGroup
            v-else
          >
            <DropdownMenuItem
              v-for="action in actionsOrSeparator"
              :key="action.id"
              :disabled="action.disabled?.(profile)"
              :class="cn(
                action.variant === 'destructive' && `text-destructive!`,
              )"
              @click="action.onClick(profile, {
                openComments: () => commentsDialogRef?.open(),
                openPriority: () => priorityDialogRef?.open(),
              })"
            >
              <span>{{ action.label(profile) }}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
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
  </div>
</template>
