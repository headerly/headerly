<script setup lang="ts">
import type { RuleActionType } from "@/lib/schema";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRuleActionType } from "#/composables/useRuleActionType";
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

const ruleActionType = defineModel<RuleActionType>("ruleActionType", {
  required: true,
});

const emit = defineEmits<{
  (e: "changed"): void;
}>();

const { t } = useI18n();
const { getRuleActionTypeLabel } = useRuleActionType();

const openState = ref(false);
const typeInput = ref<RuleActionType>(ruleActionType.value);

function open() {
  typeInput.value = ruleActionType.value;
  openState.value = true;
}

const options = computed(() => ([
  "modifyHeaders",
  "redirect",
  "block",
  "allow",
  "upgradeScheme",
  "allowAllRequests",
] as const satisfies RuleActionType[]).map(value => ({
  value,
  label: getRuleActionTypeLabel(value),
})));

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
        <DialogTitle>{{ t("profile.changeType.title") }}</DialogTitle>
        <DialogDescription>
          {{ t("profile.changeType.description") }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex items-center space-x-2 py-4">
        <Select v-model="typeInput">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="t('profile.changeType.placeholder')" />
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
            {{ t("common.cancel") }}
          </Button>
        </DialogClose>
        <Button @click="handleConfirm">
          {{ t("common.confirm") }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
