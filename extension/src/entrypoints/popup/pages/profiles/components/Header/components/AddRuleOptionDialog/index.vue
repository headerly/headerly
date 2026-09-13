<script setup lang="ts">
import type { AddRuleOptionDialogTabValue } from "./shared";
import { Button } from "@headerly/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@headerly/ui/components/dialog";
import { Kbd, KbdGroup } from "@headerly/ui/components/kbd";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@headerly/ui/components/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@headerly/ui/components/tooltip";
import { useEventBus } from "@vueuse/core";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { openAddRuleOptionDialogKey } from "./open";
import TabList from "./TabList.vue";
import { useCreateTabs } from "./tabs";

const { defaultTab, class: className } = defineProps<{
  defaultTab: AddRuleOptionDialogTabValue;
  class?: string;
  shortcutKeys?: string[];
  tooltipText: string;
}>();

const currentTab = ref<AddRuleOptionDialogTabValue>(defaultTab);
const isOpen = ref(false);
const { t } = useI18n();
const tabs = useCreateTabs();

const bus = useEventBus(openAddRuleOptionDialogKey);
bus.on(({ target }) => {
  isOpen.value = true;
  currentTab.value = target;
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <TooltipProvider ignore-non-keyboard-focus>
      <Tooltip>
        <TooltipTrigger as-child>
          <DialogTrigger as-child>
            <Button
              variant="secondary"
              class="text-brand!"
              size="icon-sm"
              :class="className"
              @click="() => {
                currentTab = defaultTab
              }"
            >
              <i class="i-lucide-plus size-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" class="flex items-center gap-2">
          <span>{{ tooltipText }}</span>
          <KbdGroup v-if="shortcutKeys?.length" class="z-50">
            <Kbd v-for="key in shortcutKeys" :key>
              {{ key }}
            </Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="sr-only">
          {{ t("profile.header.addActionOrCondition") }}
        </DialogTitle>
      </DialogHeader>

      <Tabs v-model="currentTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
          <TabList
            :tab-value="tab.value"
            :items="tab.items"
            @close="isOpen = false"
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
