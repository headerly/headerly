<script setup lang="ts">
import type { Filter } from "@/lib/schema";
import { computed } from "vue";
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

const model = defineModel<NonNullable<Filter["isUrlFilterCaseSensitive"]>>({
  required: true,
});

const profilesStore = useProfilesStore();
const { t } = useI18n();

const radioValue = computed({
  get: () => String(model.value.value),
  set: (val: string) => {
    model.value.value = val === "true";
  },
});
</script>

<template>
  <Fieldset
    :name="t('condition.urlFilterCaseSensitive.title')"
  >
    <template #main>
      <RadioGroup v-model="radioValue" class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <RadioGroupItem id="on" value="true" />
          <Label for="on" class="font-normal">{{ t("common.on") }}</Label>
        </div>
        <div class="flex items-center gap-2">
          <RadioGroupItem id="off" value="false" />
          <Label for="off" class="font-normal">{{ t("common.off") }}</Label>
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
                delete profilesStore.selectedProfile.filters.isUrlFilterCaseSensitive
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
