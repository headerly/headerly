<script setup lang="ts" generic="T extends GroupItem">
import type { GroupItem } from "@/lib/type";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import { head } from "es-toolkit";
import { ref, useTemplateRef } from "vue";

const list = defineModel<T[]>("list", {
  required: true,
});

const field = defineModel<T>("field", {
  required: true,
});

const { index } = defineProps<{
  index: number;
}>();

const commentsDialogRef = useTemplateRef("commentsDialogRef");

const moreActions = [
  {
    key: "duplicate",
    label: "Duplicate",
    onClick: () => {
      const newField = { ...field.value, id: crypto.randomUUID() };
      list.value.splice(index + 1, 0, newField);
    },
  },
  {
    key: "comments",
    label: "Comments",
    onClick: () => commentsDialogRef.value?.open(),
  },
  { divider: true, key: "divider" },
  {
    key: "moveUp",
    label: "Move up",
    get disabled() {
      return index === 0;
    },
    onClick: () => {
      const fieldToMove = head(list.value.splice(index, 1));
      list.value.splice(index - 1, 0, fieldToMove!);
    },
  },
  {
    key: "moveDown",
    label: "Move down",
    get disabled() {
      return index === list.value.length - 1;
    },
    onClick: () => {
      const fieldToMove = head(list.value.splice(index, 1));
      list.value.splice(index + 1, 0, fieldToMove!);
    },
  },
];

const comments = ref(field.value.comments || "");
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button size="icon-xs" variant="secondary">
        <i class="i-lucide-ellipsis-vertical size-4" />
        <span class="sr-only">More options</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-40" align="end" :collision-padding="8">
      <slot name="buttons-before" />
      <DropdownMenuSeparator
        v-if="$slots['buttons-before']"
      />
      <template v-for="action in moreActions" :key="action.key">
        <DropdownMenuSeparator v-if="action.divider" />
        <DropdownMenuItem
          v-else
          :disabled="action.disabled"
          @click="action.onClick"
        >
          <span>{{ action.label }}</span>
        </DropdownMenuItem>
      </template>
      <DropdownMenuSeparator v-if="$slots['buttons-after']" />
      <slot name="buttons-after" />
    </DropdownMenuContent>
  </DropdownMenu>
  <CommentsDialog
    ref="commentsDialogRef"
    v-model="comments"
  />
</template>
