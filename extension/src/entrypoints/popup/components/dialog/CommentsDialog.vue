<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

const comments = defineModel<string>({
  required: true,
});

const commentsInput = ref(comments.value);

const commentsDialogRef = useTemplateRef("commentsDialogRef");

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
        <button class="btn btn-circle btn-ghost btn-sm absolute top-2 right-2">
          <i class="i-lucide-x size-4" />
        </button>
      </form>
      <h3 class="text-lg font-semibold">
        Edit Comments
      </h3>
      <textarea
        v-model="commentsInput"
        class="textarea mt-4 h-24 w-full text-base"
        placeholder="Add your comments here..."
        autofocus
      />
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-soft">
            Cancel
          </button>
        </form>
        <button
          class="btn btn-soft btn-primary"
          @click="handleSave"
        >
          Save
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>
        <span class="sr-only">Close</span>
      </button>
    </form>
  </dialog>
</template>
