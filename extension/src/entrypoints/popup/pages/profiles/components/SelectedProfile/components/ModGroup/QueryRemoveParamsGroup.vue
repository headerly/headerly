<script setup lang="ts">
import type { RemoveParamsGroup } from "@/lib/schema";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import Group from "#/components/group/Group.vue";
import GroupActions from "#/components/group/GroupActions.vue";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import { addItemToGroup, createRadioGroupAction } from "@/lib/utils";

const group = defineModel<RemoveParamsGroup>({
  required: true,
});

const emit = defineEmits<{
  (e: "deleteGroup"): void;
}>();

function addNewField() {
  addItemToGroup(group.value.items, createRadioGroupAction(), group.value.type);
}
</script>

<template>
  <Group
    v-model:list="group.items"
    :type="group.type"
    name="Transform Query Remove Params"
    @delete-empty-group="emit('deleteGroup')"
  >
    <template #name-after>
      <GroupActions
        v-model:list="group.items"
        v-model:type="group.type"
        description="The list of query keys to be removed."
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
            v-model.trim.lazy="group.items[index]!.value"
            type="text"
            placeholder="Query key"
            class="
              text-base
              placeholder:italic
            "
          />
        </div>
        <div class="flex items-center gap-0.5">
          <Button
            size="icon-xs"
            variant="secondary"
            @click="() => {
              group.items.splice(index, 1);
            }"
          >
            <span class="sr-only">Delete this query key</span>
            <i class="i-lucide-x size-4" />
          </Button>
          <ActionsDropdown
            v-model:list="group.items"
            v-model:field="group.items[index]!"
            :index
          />
        </div>
      </div>
    </template>
  </Group>
</template>
