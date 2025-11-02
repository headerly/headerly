<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

const comments = defineModel<string>({
  required: true,
});

const commentsInput = ref(comments.value);

const commentsDialogRef = useTemplateRef("commentsDialogRef");

const UI_TEXT = {
  title: "Edit Comments",
  placeholder: "Add your comments here...",
  save: "Save",
  cancel: "Cancel",
  close: "Close",
} as const;

function open() {
  commentsInput.value = comments.value;
  commentsDialogRef.value?.showModal();
}

function close() {
  commentsDialogRef.value?.close();
}

function handleSave() {
  comments.value = commentsInput.value;
  close();
}

defineExpose({
  open,
});
</script>

<template>
  <dialog
    ref="commentsDialogRef"
    class="modal modal-middle"
  >
    <div class="modal-box">
      <form method="dialog">
        <button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">
          <i class="i-lucide-x size-4" />
        </button>
      </form>
      <h3 class="text-lg font-semibold">
        {{ UI_TEXT.title }}
      </h3>
      <textarea
        v-model="commentsInput"
        class="textarea mt-4 h-24 w-full text-base"
        :placeholder="UI_TEXT.placeholder"
        autofocus
      />
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-soft">
            {{ UI_TEXT.cancel }}
          </button>
        </form>
        <button
          class="btn btn-soft btn-primary"
          @click="handleSave"
        >
          {{ UI_TEXT.save }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>
        <span class="sr-only">{{ UI_TEXT.close }}</span>
      </button>
    </form>
  </dialog>
</template>
