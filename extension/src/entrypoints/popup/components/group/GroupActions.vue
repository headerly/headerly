<script setup lang="ts" generic="T extends GroupItem">
import type { VNode } from "vue";
import type { GroupItem, GroupType } from "@/lib/schema";
import { useI18n } from "vue-i18n";
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
  description?: string | string[] | VNode;
  type?: GroupType;
}>();

const emit = defineEmits<{
  (e: "deleteGroup"): void;
  (e: "newField"): void;
  (e: "update:type", value: GroupType): void;
}>();

const { t } = useI18n();

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
          <Button size="icon-xs" variant="secondary">
            <i class="i-lucide-circle-question-mark size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          :collision-padding="20"
          side="top"
          class="prose prose-sm max-w-lg"
        >
          <template v-if="typeof description === 'string'">
            {{ description }}
          </template>
          <div v-else-if="Array.isArray(description)" class="space-y-2">
            <p
              v-for="paragraph in description"
              :key="paragraph"
            >
              {{ paragraph }}
            </p>
          </div>
          <div v-else class="max-h-40 overflow-y-auto">
            <component :is="description" />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-xs"
            variant="secondary"
            @click="emit('newField')"
          >
            <i class="i-lucide-plus size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {{ t("group.actions.addItem") }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-xs"
            variant="secondary"
            @click="emit('deleteGroup')"
          >
            <i class="i-lucide-x size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {{ t("group.actions.deleteGroup") }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider v-if="type">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-xs"
            variant="secondary"
            @click="transferGroupType"
          >
            <i
              :class="cn('size-4', type === 'checkbox'
                ? `i-lucide-square-check-big` : `i-lucide-circle-dot`)"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {{ t("group.actions.transferGroupTypeTo") }}
          {{ type === 'checkbox' ? t("common.radio") : t("common.checkbox") }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <slot name="buttons-after" />
  </div>
</template>
