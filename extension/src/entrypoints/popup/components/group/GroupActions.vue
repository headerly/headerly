<script setup lang="ts" generic="T extends GroupItem">
import type { VNode } from "vue";
import type { GroupItem, GroupType } from "@/lib/type";
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { cn } from "@/lib/utils";

const list = defineModel<T[]>("list", {
  required: true,
});

const { description, type } = defineProps<{
  description?: string | VNode;
  type?: GroupType;
}>();

const emit = defineEmits<{
  (e: "deleteGroup"): void;
  (e: "newField"): void;
  (e: "update:type", value: GroupType): void;
}>();

function transferGroupType() {
  if (type === "checkbox") {
    emit("update:type", "radio");
    const firstEnabledMod = list.value.find(mod => mod.enabled);
    list.value.forEach((mod) => {
      mod.enabled = mod === firstEnabledMod;
    });
  } else {
    emit("update:type", "checkbox");
  }
}
</script>

<template>
  <div class="flex gap-1">
    <slot name="buttons-before" />
    <TooltipProvider v-if="description">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button size="icon-xs" variant="outline">
            <i class="i-lucide-circle-question-mark size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          :collision-padding="20"
          side="top"
          class="prose prose-sm max-h-40 max-w-lg overflow-y-auto"
        >
          <p v-if="typeof description === 'string'">
            {{ description }}
          </p>
          <component :is="description" v-else />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-xs"
            variant="outline"
            @click="emit('newField')"
          >
            <i class="i-lucide-plus size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Add a new item
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-xs"
            variant="outline"
            class="text-destructive!"
            @click="emit('deleteGroup')"
          >
            <i class="i-lucide-x size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Delete this group
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider v-if="type">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-xs"
            variant="outline"
            @click="transferGroupType"
          >
            <i
              :class="cn('size-4', type === 'checkbox'
                ? `i-lucide-square-check-big` : `i-lucide-circle-dot`)"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Transfer group type to
          {{ type === 'checkbox' ? 'Radio' : 'Checkbox' }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <slot name="buttons-after" />
  </div>
</template>
