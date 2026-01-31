<script setup lang="ts">
import { Button } from "#/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/ui/dialog";
import { Label } from "#/ui/label";
import { Textarea } from "#/ui/textarea";
import { ref } from "vue";

const comments = defineModel<string>({
  required: true,
});

const openState = ref(false);
const commentsInput = ref(comments.value);

function open() {
  commentsInput.value = comments.value;
  openState.value = true;
}

function handleSave() {
  comments.value = commentsInput.value;
  openState.value = false;
}

defineExpose({
  open,
});
</script>

<template>
  <Dialog v-model:open="openState">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Comments</DialogTitle>
        <DialogDescription class="sr-only">
          Add or edit comments for this profile field.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-2 py-2">
        <Label for="comments" class="sr-only">Comments</Label>
        <Textarea
          id="comments"
          v-model="commentsInput"
          class="min-h-32 text-base"
          placeholder="Add your comments here..."
          autofocus
        />
      </div>
      <DialogFooter class="flex flex-row justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button @click="handleSave">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
