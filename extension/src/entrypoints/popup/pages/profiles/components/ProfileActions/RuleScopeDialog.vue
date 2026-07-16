<script setup lang="ts">
import type { RuleType } from "@/lib/schema";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/ui/select";
import { getRuleScopeLabel } from "@/lib/utils";

const ruleScope = defineModel<RuleType>({
  required: true,
});

const emit = defineEmits<{
  (e: "changed"): void;
}>();

const { t } = useI18n();

const openState = ref(false);
const scopeInput = ref<RuleType>(ruleScope.value ?? "dynamic");

function open() {
  scopeInput.value = ruleScope.value ?? "dynamic";
  openState.value = true;
}

const options = computed(() => ([
  "dynamic",
  "session",
] as const satisfies RuleType[]).map(value => ({
  value,
  label: getRuleScopeLabel(value),
})));

function handleConfirm() {
  if (scopeInput.value !== ruleScope.value) {
    ruleScope.value = scopeInput.value;
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
        <DialogTitle>{{ t("profile.changeScope.title") }}</DialogTitle>
        <DialogDescription>
          {{ t("profile.changeScope.description") }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-2 py-4">
        <Select v-model="scopeInput">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="t('profile.changeScope.placeholder')" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p class="text-sm text-muted-foreground">
          {{ scopeInput === "dynamic"
            ? t("ruleScope.description.dynamic")
            : t("ruleScope.description.session") }}
        </p>
        <p
          v-if="scopeInput === 'dynamic' && ruleScope === 'session'"
          class="text-sm text-destructive"
        >
          {{ t("profile.changeScope.dynamicRemovesTabConditions") }}
        </p>
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
