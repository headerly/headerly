<script setup lang="ts" generic="T extends GroupItem">
import type { GroupItem } from "@/lib/schema";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import { uuidv7 } from "uuidv7";
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
      const newField = { ...field.value, id: uuidv7() };
      list.value.splice(index + 1, 0, newField);
    },
  },
  {
    key: "comments",
    label: "Comments",
    onClick: () => commentsDialogRef.value?.open(),
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
        <DropdownMenuItem
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
