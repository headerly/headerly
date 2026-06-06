<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import { sendMessage } from "##/background/message";
import Fieldset from "#/components/group/Fieldset.vue";
import InfoTooltip from "#/components/InfoTooltip.vue";
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
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import { settings } from "./fields";

const settingsStore = useSettingsStore();
const { t } = useI18n();
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
        :key="setting.fieldsetTitleKey"
        :name="t(setting.fieldsetTitleKey)"
        class="gap-y-4 border bg-primary-foreground p-4 text-base"
      >
        <template #main>
          <div class="flex size-full flex-col gap-2">
            <template v-for="field in setting.fields" :key="field.labelKey">
              <div
                v-if="field.type === 'select'"
              >
                <Label
                  class="flex flex-col items-start whitespace-normal"
                >
                  {{ t("settings.fieldLabel", { label: t(field.labelKey) }) }}
                  <div class="flex items-center gap-1">
                    <Select
                      v-model="settingsStore[field.key]"
                      @update:model-value="value => field.onChange?.(String(value))"
                    >
                      <SelectTrigger class="min-w-60">
                        <SelectValue :placeholder="t('common.selectOptions')" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem v-for="option in field.options" :key="option.value" :value="option.value">
                            {{ "labelKey" in option ? t(option.labelKey) : option.label }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                  {{ t(field.labelKey) }}
                  <InfoTooltip
                    v-if="'descriptionKey' in field && field.descriptionKey"
                    :description="t(field.descriptionKey)"
                  />
                </Label>
              </div>
            </template>
          </div>
        </template>
      </Fieldset>
      <Fieldset
        class="gap-y-4 border bg-primary-foreground p-4 text-base"
        :name="t('settings.groups.troubleshooting')"
      >
        <template #main>
          <div class="flex gap-2">
            <Button
              variant="secondary"
              class="flex items-center"
              @click="async () => {
                try {
                  await sendMessage('reinitializeAllRules');
                  toast.success(t('settings.troubleshooting.reinitializeSuccess'));
                } catch (error) {
                  toast.error(t('settings.troubleshooting.reinitializeError'));
                }
              }"
            >
              {{ t("settings.troubleshooting.reinitializeAll") }}
              <InfoTooltip :description="t('settings.troubleshooting.reinitializeDescription')" />
            </Button>
            <Button as-child>
              <a target="_blank" href="https://github.com/headerly/headerly/issues/new?template=BUG_REPORT.yml">
                <i class="i-lucide-github" />
                {{ t("common.reportIssue") }}
              </a>
            </Button>
          </div>
        </template>
      </Fieldset>
    </main>
  </div>
</template>
