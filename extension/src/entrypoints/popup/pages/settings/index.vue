<script setup lang="tsx">
import { sendMessage } from "##/background/message";
import Fieldset from "#/components/group/Fieldset.vue";
import { Button } from "#/ui/button";
import { Checkbox } from "#/ui/checkbox";
import { Label } from "#/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { toast } from "vue-sonner";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import { settings } from "./fields";

const settingsStore = useSettingsStore();

function InfoTooltip({ description }: { description: string }) {
  return (
    <TooltipProvider delay-duration={200}>
      <Tooltip>
        <TooltipTrigger as-child>
          <button class="flex items-center">
            <i class="i-lucide-circle-question-mark size-4 cursor-pointer" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" class="w-80">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
</script>

<template>
  <div
    class="
      grid size-full grid-cols-[3rem_minmax(0,1fr)]
      grid-rows-[3rem_minmax(0,1fr)]
    "
  >
    <Header class="col-start-2 row-start-1" />
    <Sidebar class="col-start-1 row-span-2" />
    <main
      class="
        col-start-2 row-start-2 overflow-x-hidden overflow-y-auto px-2 pb-2
      "
    >
      <Fieldset
        v-for="setting in settings"
        :id="setting.anchor"
        :key="setting.fieldsetTitle"
        :name="setting.fieldsetTitle"
        class="gap-y-4 border bg-primary-foreground p-4 text-base"
      >
        <template #main>
          <div class="flex size-full flex-col gap-2">
            <template v-for="field in setting.fields" :key="field.label">
              <div
                v-if="field.type === 'select'"
              >
                <Label
                  class="flex flex-col items-start whitespace-normal"
                >
                  {{ field.label }}:
                  <div class="flex items-center gap-1">
                    <Select v-model="settingsStore[field.key]">
                      <SelectTrigger class="min-w-60">
                        <SelectValue placeholder="Select a fruit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem v-for="option in field.options" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InfoTooltip
                      v-if="'description' in field && field.description"
                      :description="field.description"
                    />
                  </div>
                </Label>
              </div>
              <div
                v-else-if="field.type === 'checkbox'"
                class="flex items-center"
              >
                <Label
                  class="flex items-center whitespace-normal"
                >
                  <Checkbox
                    v-model="settingsStore[field.key]"
                  />
                  {{ field.label }}
                  <InfoTooltip
                    v-if="'description' in field && field.description"
                    :description="field.description"
                  />
                </Label>
              </div>
            </template>
          </div>
        </template>
      </Fieldset>
      <Fieldset
        class="gap-y-4 border bg-primary-foreground p-4 text-base"
        name="Troubleshooting"
      >
        <template #main>
          <div class="flex gap-2">
            <Button
              variant="secondary"
              class="flex items-center"
              @click="async () => {
                try {
                  await sendMessage('reinitializeAllRules');
                  toast.success('All profiles have been reinitialized. Please check if the issue is resolved. If not, please report this issue to us.');
                } catch (error) {
                  toast.error('Failed to reinitialize profiles. Please report this issue to us.');
                }
              }"
            >
              Reinitialize all profiles
              <InfoTooltip description="If you find that the number of active profiles you defined is inconsistent with the number displayed in the extension popup badge, please click the button below." />
            </Button>
            <Button as-child>
              <a href="https://github.com/headerly/headerly/issues/new?template=BUG_REPORT.yml">
                <i class="i-lucide-github" />
                Report an issue
              </a>
            </Button>
          </div>
        </template>
      </Fieldset>
    </main>
  </div>
</template>
