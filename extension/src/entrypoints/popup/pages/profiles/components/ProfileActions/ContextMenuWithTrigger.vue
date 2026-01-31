<script setup lang="ts">
import type { Profile } from "@/lib/type";
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
import { computed, useTemplateRef } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { cn } from "@/lib/utils";
import { useProfileActions } from "./actions";

const props = defineProps<{
  profile: Profile;
}>();

const profilesStore = useProfilesStore();
const profile = computed(() => profilesStore.manager.profiles.find(p => p.id === props.profile.id)!);

const actions = useProfileActions();
const commentsDialogRef = useTemplateRef("commentsDialogRef");

const actionGroups = [
  ["toggle", "duplicate", "delete", "comments", "copyJson", "copyId"],
  ["moveUp", "moveDown"],
];

function getAction(id: string) {
  return actions.find(a => a.id === id);
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
      <template v-for="(group, index) in actionGroups" :key="index">
        <ContextMenuSeparator v-if="index > 0" />
        <ContextMenuGroup>
          <template v-for="id in group" :key="id">
            <ContextMenuItem
              v-if="getAction(id)"
              :disabled="getAction(id)?.disabled?.(profile)"
              :class="cn(
                getAction(id)?.variant === 'destructive' && 'text-destructive!',
              )"
              @click="getAction(id)?.onClick(profile, { openComments: () => commentsDialogRef?.open() })"
            >
              {{ getAction(id)?.label(profile) }}
            </ContextMenuItem>
          </template>
        </ContextMenuGroup>
      </template>
    </ContextMenuContent>
    <CommentsDialog
      ref="commentsDialogRef"
      v-model="profile.comments"
    />
  </ContextMenu>
</template>
