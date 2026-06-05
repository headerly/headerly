<script setup lang="ts">
import type { RadioGroupActionItem } from "@/lib/schema";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { useCurrentTabUrl } from "#/composables/useCurrentTabUrl";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { addItemToGroup, createRadioGroupAction } from "@/lib/utils";

const list = defineModel<RadioGroupActionItem[]>({
  required: true,
});

const props = withDefaults(defineProps<{
  name: string;
  description: string;
  placeholder: string;
  inputType?: "url" | "text";
  showUseCurrentTabButton?: boolean;
}>(), {
  inputType: "text",
  showUseCurrentTabButton: false,
});

const emit = defineEmits<{
  (e: "deleteGroup"): void;
}>();

const { currentUrl, canUseCurrentUrl } = useCurrentTabUrl();

function addNewField() {
  addItemToGroup(list.value, createRadioGroupAction(), "radio");
}
</script>

<template>
  <Group
    v-model:list="list"
    type="radio"
    :name="props.name"
    @delete-empty-group="emit('deleteGroup')"
  >
    <template #name-after>
      <GroupActions
        v-model:list="list"
        :description="props.description"
        @delete-group="emit('deleteGroup')"
        @new-field="addNewField"
      />
    </template>
    <template #item="{ index }">
      <div
        class="
          flex flex-1 flex-col items-end justify-between gap-1
          sm:flex-row sm:items-center
        "
      >
        <div class="flex w-full flex-1">
          <Input
            v-model.trim.lazy="list[index]!.value"
            :type="props.inputType"
            :placeholder="props.placeholder"
            class="
              text-base
              placeholder:italic
            "
          />
        </div>
        <div class="flex items-center gap-0.5">
          <TooltipProvider v-if="props.showUseCurrentTabButton">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  :disabled="!canUseCurrentUrl"
                  @click="() => {
                    list[index]!.value = currentUrl!.href;
                  }"
                >
                  <i class="i-lucide-at-sign size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use the URL of the current tab
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="icon-xs"
            variant="secondary"
            @click="() => {
              list.splice(index, 1);
            }"
          >
            <span class="sr-only">Delete this {{ props.name }}</span>
            <i class="i-lucide-x size-4" />
          </Button>
          <ActionsDropdown
            v-model:list="list"
            v-model:field="list[index]!"
            :index
          />
        </div>
      </div>
    </template>
  </Group>
</template>
