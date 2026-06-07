<script setup lang="ts">
import type { Filter } from "@/lib/schema";
import { useI18n } from "vue-i18n";
import Fieldset from "#/components/group/Fieldset.vue";
import { Button } from "#/ui/button";
import { Label } from "#/ui/label";
import { RadioGroup, RadioGroupItem } from "#/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";

const model = defineModel<NonNullable<Filter["domainType"]>>({
  required: true,
});

const profilesStore = useProfilesStore();
const { t } = useI18n();
</script>

<template>
  <Fieldset
    :name="t('condition.domainType.title')"
  >
    <template #main>
      <RadioGroup v-model="model.value" class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <RadioGroupItem id="firstParty" value="firstParty" />
          <Label for="firstParty" class="font-normal">{{ t("condition.domainType.firstParty") }}</Label>
        </div>
        <div class="flex items-center gap-2">
          <RadioGroupItem id="thirdParty" value="thirdParty" />
          <Label for="thirdParty" class="font-normal">{{ t("condition.domainType.thirdParty") }}</Label>
        </div>
      </RadioGroup>
    </template>
    <template #group-actions>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="secondary"
              size="icon-xs"
              @click="() => {
                delete profilesStore.selectedProfile.filters.domainType
              }"
            >
              <i class="i-lucide-x size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {{ t("common.deleteCondition") }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </template>
  </Fieldset>
</template>
