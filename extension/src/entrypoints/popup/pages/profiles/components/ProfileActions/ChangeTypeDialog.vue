<script setup lang="ts">
import type { RuleActionType } from "@/lib/schema";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/ui/select";
import { ref } from "vue";
import { getRuleActionTypeLabel } from "@/lib/utils";

const ruleActionType = defineModel<RuleActionType>("ruleActionType", {
  required: true,
});

const emit = defineEmits<{
  (e: "changed"): void;
}>();

const openState = ref(false);
const typeInput = ref<RuleActionType>(ruleActionType.value);

function open() {
  typeInput.value = ruleActionType.value;
  openState.value = true;
}

// TODO: "redirect" should be added as an option when the type is supported
const options = (["modifyHeaders", "block", "allow", "upgradeScheme", "allowAllRequests"] as const).map(value => ({
  value,
  label: getRuleActionTypeLabel(value),
}));

function handleConfirm() {
  if (typeInput.value !== ruleActionType.value) {
    ruleActionType.value = typeInput.value;
    emit("changed");
  }
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
        <DialogTitle>Change Rule Action Type</DialogTitle>
        <DialogDescription>
          Select a new action type for this profile. Switching types may remove existing actions.
        </DialogDescription>
      </DialogHeader>
      <div class="flex items-center space-x-2 py-4">
        <Select v-model="typeInput">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter class="flex flex-row justify-end gap-2">
        <DialogClose as-child>
          <Button variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button @click="handleConfirm">
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
