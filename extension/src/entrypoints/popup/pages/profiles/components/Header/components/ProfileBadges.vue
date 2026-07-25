<script setup lang="ts">
import type { Profile } from "@/lib/schema";
import { useI18n } from "vue-i18n";
import { useRuleActionType } from "#/composables/useRuleActionType";
import { useRuleScope } from "#/composables/useRuleScope";
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

const { t } = useI18n();
const ruleActionTypeMap = useRuleActionType();
const ruleScopeMap = useRuleScope();
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Badge variant="secondary">
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
          <Badge>
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Badge variant="outline">
            <i :class="ruleScopeMap[profile.ruleScope].icon" />
            <span
              class="
                hidden
                md:inline
              "
            >
              {{ ruleScopeMap[profile.ruleScope].label }}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" class="md:hidden">
          {{ t("profile.header.ruleScope", {
            scope: ruleScopeMap[profile.ruleScope].label,
          }) }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
