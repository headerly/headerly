<script setup lang="ts" generic="T extends GroupItem">
import type { GroupItem } from "@/lib/schema";
import { uuidv7 } from "uuidv7";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import CommentsDialog from "#/pages/profiles/components/CommentsDialog.vue";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import FieldCommentsButton from "./FieldCommentsButton.vue";

const list = defineModel<T[]>("list", {
  required: true,
});

const field = defineModel<T>("field", {
  required: true,
});

const { index } = defineProps<{
  index: number;
}>();

const { t } = useI18n();
const settingsStore = useSettingsStore();

const commentsDialogRef = useTemplateRef("commentsDialogRef");

const moreActions = computed(() => [
  {
    key: "duplicate",
    label: t("common.duplicate"),
    onClick: () => {
      const newField = { ...field.value, id: uuidv7() };
      list.value.splice(index + 1, 0, newField);
    },
  },
  {
    key: "comments",
    label: t("common.comments"),
    onClick: () => commentsDialogRef.value?.open(),
  },
].filter(action => action.key !== "comments" || !settingsStore.showCommentsInline));
</script>

<template>
  <FieldCommentsButton
    v-if="settingsStore.showCommentsInline"
    v-model="field.comments"
  />
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button size="icon-xs" variant="secondary">
        <i class="i-lucide-ellipsis-vertical size-4" />
        <span class="sr-only">{{ t("common.moreOptions") }}</span>
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
    v-if="!settingsStore.showCommentsInline"
    ref="commentsDialogRef"
    v-model="field.comments"
  />
</template>
