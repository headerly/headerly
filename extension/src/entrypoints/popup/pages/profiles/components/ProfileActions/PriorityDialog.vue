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
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "#/ui/number-field";
import { computed, ref } from "vue";

const priority = defineModel<number>({
  default: 1,
});

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
        <DialogTitle>Edit Rule Priority</DialogTitle>
        <DialogDescription>
          <p>
            Priority defines the conflict resolution strategy for rules.
            When multiple rules match a single request, the system executes
            the rule with the higher weight as a priority.
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
            Cancel
          </Button>
        </DialogClose>
        <Button :disabled="!isValid" @click="handleSave">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
