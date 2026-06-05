<script setup lang="ts">
import type { QueryKeyValueItem } from "@/lib/schema";
import ActionsDropdown from "#/components/group/FieldActionsDropdown.vue";
import { Button } from "#/ui/button";
import { Input } from "#/ui/input";
import { Toggle } from "#/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";

const list = defineModel<QueryKeyValueItem[]>("list", {
  required: true,
});

const field = defineModel<QueryKeyValueItem>("field", {
  required: true,
});

const { index } = defineProps<{
  index: number;
}>();
</script>

<template>
  <div
    class="
      flex flex-1 flex-col items-end justify-between gap-1
      sm:flex-row sm:items-center
    "
  >
    <div
      class="
        grid w-full flex-1 grid-rows-2 gap-1
        sm:grid-cols-2 sm:grid-rows-1
      "
    >
      <Input
        v-model.trim.lazy="field.key"
        type="text"
        placeholder="Key"
        class="
          text-base
          placeholder:italic
        "
      />
      <Input
        v-model.trim.lazy="field.value"
        type="text"
        placeholder="Value"
        class="
          text-base
          placeholder:italic
        "
      />
    </div>
    <div class="flex items-center gap-0.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as="div">
            <Toggle
              :model-value="field.replaceOnly"
              size="sm"
              type="button"
              class="size-6! min-w-auto!"
              @update:model-value="(value) => {
                field.replaceOnly = value
              }"
            >
              <i class="i-lucide-replace size-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="top" :collision-padding="20" class="max-w-xs">
            If true, the query key is replaced only if it's already present. Otherwise, the key is also added if it's missing. Defaults to false.
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
        <span class="sr-only">Delete this query key-value pair</span>
        <i class="i-lucide-x size-4" />
      </Button>
      <ActionsDropdown
        v-model:list="list"
        v-model:field="field"
        :index
      />
    </div>
  </div>
</template>
