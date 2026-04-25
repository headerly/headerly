<script setup lang="ts">
import type { Filter } from "@/lib/schema";
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
</script>

<template>
  <Fieldset
    name="Domain Type"
  >
    <template #main>
      <RadioGroup v-model="model.value" class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <RadioGroupItem id="firstParty" value="firstParty" />
          <Label for="firstParty" class="font-normal">First Party</Label>
        </div>
        <div class="flex items-center gap-2">
          <RadioGroupItem id="thirdParty" value="thirdParty" />
          <Label for="thirdParty" class="font-normal">Third Party</Label>
        </div>
      </RadioGroup>
    </template>
    <template #name-after>
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
            Delete this condition
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </template>
  </Fieldset>
</template>
