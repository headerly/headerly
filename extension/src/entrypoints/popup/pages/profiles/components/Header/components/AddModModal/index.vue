<script setup lang="ts">
import { Button } from "#/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useEventBus } from "@vueuse/core";
import { ref } from "vue";
import { openAddModModalKey } from "./open";
import { tabs } from "./tabs";

const { defaultTab, class: className } = defineProps<{
  defaultTab: "actions" | "conditions";
  class?: string;
  tooltipText: string;
}>();

const currentTab = ref<typeof defaultTab>(defaultTab);
const isOpen = ref(false);

const bus = useEventBus(openAddModModalKey);
bus.on(() => {
  isOpen.value = true;
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <DialogTrigger as-child>
            <Button
              variant="secondary"
              size="icon-sm"
              :class="className"
            >
              <i class="i-lucide-plus size-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ tooltipText }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="sr-only">
          Add action or condition
        </DialogTitle>
      </DialogHeader>

      <Tabs v-model="currentTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
            <i :class="tab.icon" class="me-2 size-4" />
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
          <div class="mt-2 flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
            <button
              v-for="{ title, description, action, disabled } in tab.items"
              :key="title"
              :disabled
              class="
                flex w-full flex-col items-start rounded-md border p-3 text-left
                text-sm transition-colors
                hover:bg-accent
                disabled:pointer-events-none disabled:opacity-50
              "
              @click="() => {
                action()
                isOpen = false
              }"
            >
              <div class="font-semibold">
                {{ title }}
              </div>
              <div class="text-xs text-muted-foreground">
                {{ description }}
              </div>
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
