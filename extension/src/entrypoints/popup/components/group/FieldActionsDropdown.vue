<script setup lang="ts" generic="T extends GroupItem">
import type { GroupItem } from "@/lib/type";
import CommentsDialog from "#/components/dialog/CommentsDialog.vue";
import { head } from "es-toolkit";
import { ref, useTemplateRef } from "vue";
import { cn } from "@/lib/utils";

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
    icon: "i-lucide-copy-plus",
    onClick: () => {
      const newField = { ...field.value, id: crypto.randomUUID() };
      list.value.splice(index + 1, 0, newField);
    },
  },
  {
    key: "comments",
    label: "Comments",
    icon: "i-lucide-square-pen",
    onClick: () => commentsDialogRef.value?.open(),
    get indicator() {
      return Boolean(field.value.comments.length);
    },
  },
  { divider: true, key: "divider" },
  {
    key: "moveUp",
    label: "Move Up",
    icon: "i-lucide-arrow-big-up",
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
    label: "Move Down",
    icon: "i-lucide-arrow-big-down",
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

const popovertarget = `popover-group-more-action-${field.value.id}`;
const anchorname = `--anchor-group-more-action-${field.value.id}`;
</script>

<template>
  <button
    :popovertarget
    :style="`anchor-name:${anchorname}`"
    class="btn btn-square btn-ghost btn-xs btn-primary"
  >
    <i class="i-lucide-ellipsis-vertical size-4" />
    <span class="sr-only">More options</span>
  </button>
  <ul
    :id="popovertarget"
    :style="`position-anchor:${anchorname}`"
    popover
    class="
      menu dropdown rounded-box bg-base-300 text-base-content w-52 p-2
      font-medium shadow-sm
      [position-area:end_span-start]
      [position-try-fallbacks:flip-block]
    "
  >
    <slot name="buttons-before" />
    <div v-if="$slots['buttons-before']" class="divider my-0" />
    <template v-for="action in moreActions" :key="action.key">
      <div v-if="action.divider" class="divider my-0" />
      <li v-else>
        <button
          class="disabled:pointer-events-none disabled:opacity-60"
          :disabled="action.disabled"
          @click="action.onClick"
        >
          <i :class="cn('size-4', action.icon)" />
          <div class="indicator pr-2">
            <span>{{ action.label }}</span>
            <span
              v-if="action.indicator"
              class="indicator-item status status-success indicator-middle"
            />
          </div>
        </button>
      </li>
    </template>
    <div v-if="$slots['buttons-after']" class="divider my-0" />
    <slot name="buttons-after" />
  </ul>
  <CommentsDialog
    ref="commentsDialogRef"
    v-model="comments"
  />
</template>
