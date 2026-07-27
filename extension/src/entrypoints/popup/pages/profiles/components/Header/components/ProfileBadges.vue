<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { useI18n } from "vue-i18n";
import { useRuleActionType } from "#/composables/useRuleActionType";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { Badge } from "@/entrypoints/popup/ui/badge";

const { profile } = defineProps<{
  profile: Profile;
}>();

defineEmits<{
  openChangeRuleActionType: [];
  openPriority: [];
}>();

const { t } = useI18n();
const ruleActionTypeMap = useRuleActionType();
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Badge
            as="button"
            type="button"
            variant="secondary"
            class="
              cursor-pointer
              hover:bg-secondary/90
            "
            :aria-label="t('profile.header.priorityValue', { priority: profile.priority ?? 1 })"
            @click="$emit('openPriority')"
          >
            <i class="i-lucide-layers-2" />
            <span
              class="
                hidden
                md:inline
              "
            >
              {{ t("profile.header.priorityLabel") }}
            </span>
            <span
              class="
                max-w-4 truncate
                md:max-w-none
              "
            >
              {{ profile.priority ?? 1 }}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" class="md:hidden">
          {{ t("profile.header.priorityValue", { priority: profile.priority ?? 1 }) }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Badge
            as="button"
            type="button"
            class="
              cursor-pointer
              hover:bg-primary/90
            "
            :aria-label="t('profile.header.ruleActionType', {
              type: ruleActionTypeMap[profile.ruleActionType].label,
            })"
            @click="$emit('openChangeRuleActionType')"
          >
            <i :class="ruleActionTypeMap[profile.ruleActionType].icon" />
            <span
              class="
                hidden
                md:inline
              "
            >
              {{ ruleActionTypeMap[profile.ruleActionType].label }}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" class="md:hidden">
          {{ t("profile.header.ruleActionType", {
            type: ruleActionTypeMap[profile.ruleActionType].label,
          }) }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
