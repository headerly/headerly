<script setup lang="ts">
import { computed, ref } from "vue";
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
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "#/ui/number-field";

const priority = defineModel<number>({
  default: 1,
});

const { t } = useI18n();

const openState = ref(false);
const priorityInput = ref(priority.value);

const INT32_MAX = 2 ** 31 - 1;
const isValid = computed(() => {
  return priorityInput.value >= 1 && priorityInput.value <= INT32_MAX && Number.isInteger(priorityInput.value);
});

function open() {
  priorityInput.value = priority.value ?? 1;
  openState.value = true;
}

function handleSave() {
  if (isValid.value) {
    priority.value = priorityInput.value;
    openState.value = false;
  }
}

defineExpose({
  open,
});
</script>

<template>
  <Dialog v-model:open="openState">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t("profile.priority.title") }}</DialogTitle>
        <DialogDescription>
          <p>
            {{ t("profile.priority.description") }}
          </p>
        </DialogDescription>
      </DialogHeader>
      <div
        class="grid w-full justify-items-start gap-2 py-2"
      >
        <NumberField
          id="priority"
          v-model="priorityInput"
          :min="1"
          :max="INT32_MAX"
          class="w-full"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>
      <DialogFooter class="flex flex-row justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary">
            {{ t("common.cancel") }}
          </Button>
        </DialogClose>
        <Button :disabled="!isValid" @click="handleSave">
          {{ t("common.save") }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
