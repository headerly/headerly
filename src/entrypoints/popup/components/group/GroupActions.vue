<script setup lang="ts">
import type { GroupType, HeaderMod } from "@/lib/storage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { cn } from "@/lib/utils";

const emit = defineEmits<{
  (e: "deleteGroup"): void;
  (e: "newField"): void;
}>();

const list = defineModel<HeaderMod[]>("list", {
  required: true,
});

const type = defineModel<GroupType>("type", {
  required: true,
});

function transferGroupType() {
  if (type.value === "checkbox") {
    type.value = "radio";
    const firstEnabledMod = list.value.find(mod => mod.enabled);
    list.value.forEach((mod) => {
      mod.enabled = mod === firstEnabledMod;
    });
  } else {
    type.value = "checkbox";
  }
}
</script>

<template>
  <div class="flex gap-1">
    <TooltipProvider :delay-duration="200">
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            :class="cn('btn btn-square btn-ghost btn-xs', {
              'btn-info': type === 'checkbox',
              'btn-accent': type === 'radio',
            })"
            @click="transferGroupType"
          >
            <i
              :class="cn('size-4', type === 'checkbox'
                ? `i-lucide-square-check-big` : `i-lucide-circle-dot`)"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Transfer group type to
          {{ type === 'checkbox' ? 'Radio' : 'Checkbox' }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider :delay-duration="200">
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            class="btn btn-square btn-ghost btn-xs btn-primary"
            @click="emit('newField')"
          >
            <i class="i-lucide-cross size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Add a new item
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider :delay-duration="200">
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            class="btn btn-square btn-ghost btn-xs btn-error"
            @click="emit('deleteGroup')"
          >
            <i class="i-lucide-trash size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          Delete this group
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
