<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
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

const comments = defineModel<string>();

const { t } = useI18n();

const openState = ref(false);
const commentsInput = ref(comments.value ?? "");

function open() {
  commentsInput.value = comments.value ?? "";
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
        <DialogTitle>{{ t("commentsDialog.title") }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ t("commentsDialog.description") }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-2 py-2">
        <Label for="comments" class="sr-only">{{ t("common.comments") }}</Label>
        <Textarea
          id="comments"
          v-model="commentsInput"
          class="min-h-32 text-base"
          :placeholder="t('commentsDialog.placeholder')"
          autofocus
        />
      </div>
      <DialogFooter class="flex flex-row justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary">
            {{ t("common.cancel") }}
          </Button>
        </DialogClose>
        <Button @click="handleSave">
          {{ t("common.save") }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
