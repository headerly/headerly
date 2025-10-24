<script setup lang="ts">
import type { HeaderMod } from "@/lib/storage";
import { head } from "es-toolkit";
import { ref } from "vue";

const { index, length } = defineProps<{
  index: number;
  length: number;
}>();

const list = defineModel<HeaderMod[]>("list", {
  required: true,
});

const field = defineModel<HeaderMod>("field", {
  required: true,
});

const commentsDialogRef = ref<HTMLDialogElement | null>(null);

const moreActions = [
  {
    key: "duplicate",
    label: "Duplicate",
    icon: "i-lucide-copy size-4",
    onClick: () => {
      const newField = { ...field.value, id: crypto.randomUUID() };
      list.value.splice(index + 1, 0, newField);
    },
  },
  {
    key: "comments",
    label: "Comments",
    icon: "i-lucide-square-pen size-4",
    onClick: () => commentsDialogRef.value?.showModal(),
  },
  { divider: true, key: "divider" },
  {
    key: "moveUp",
    label: "Move Up",
    icon: "i-lucide-arrow-big-up size-4",
    disabled: index === 0,
    onClick: () => {
      const fieldToMove = head(list.value.splice(index, 1));
      list.value.splice(index - 1, 0, fieldToMove!);
    },
  },
  {
    key: "moveDown",
    label: "Move Down",
    icon: "i-lucide-arrow-big-down size-4",
    disabled: index === length - 1,
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
      menu dropdown w-52 rounded-box bg-base-100 p-2 font-medium
      text-base-content shadow-sm
      [position-area:end_span-start]
      [position-try-fallbacks:flip-block]
    "
  >
    <template v-for="action in moreActions" :key="action.key">
      <div v-if="action.divider" class="divider my-0" />
      <li v-else>
        <button
          class="
            gap-2
            disabled:pointer-events-none disabled:opacity-60
          "
          :disabled="action.disabled"
          @click="action.onClick"
        >
          <i :class="action.icon" />
          <span>{{ action.label }}</span>
        </button>
      </li>
    </template>
  </ul>
  <dialog ref="commentsDialogRef" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">
        Edit Comments
      </h3>
      <textarea v-model="comments" class="textarea mt-4 h-24 w-full text-base" placeholder="Comments" />
      <div class="modal-action">
        <button
          class="btn btn-sm btn-primary"
          @click="() => {
            commentsDialogRef?.close()
            field.comments = comments.trim();
          }"
        >
          Save
        </button>
        <form method="dialog">
          <button class="btn btn-sm">
            Cancel
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>
