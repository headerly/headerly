<script setup lang="ts">
import CommentsDialog from "#/components/dialog/CommentsDialog.vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import { useTemplateRef } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { copyProfile, copyProfileId } from "./copyProfile";

const profilesStore = useProfilesStore();

const commentsDialogRef = useTemplateRef("commentsDialogRef");
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="icon-sm"
      >
        <i class="i-lucide-ellipsis-vertical size-4" />
        <span class="sr-only">Open Secondary Operations Dropdown</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-40">
      <DropdownMenuGroup>
        <DropdownMenuItem @click="() => copyProfile(profilesStore.selectedProfile)">
          Copy to JSON
        </DropdownMenuItem>
        <DropdownMenuItem @click="() => copyProfileId(profilesStore.selectedProfile)">
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem @click="profilesStore.duplicateProfile()">
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem @click="commentsDialogRef?.open()">
          {{ profilesStore.selectedProfile.comments.length > 0 ? "Edit comments" : "Add comments" }}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        :disabled="!profilesStore.canMoveProfileUp()"
        @click="profilesStore.moveProfileUp()"
      >
        Move up
      </DropdownMenuItem>
      <DropdownMenuItem
        :disabled="!profilesStore.canMoveProfileDown()"
        @click="profilesStore.moveProfileDown()"
      >
        Move down
      </DropdownMenuItem>
    </DropdownMenuContent>
    <CommentsDialog
      ref="commentsDialogRef"
      v-model="profilesStore.selectedProfile.comments"
    />
  </DropdownMenu>
</template>
