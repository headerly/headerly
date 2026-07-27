<script setup lang="ts">
import type { Option } from "#/ui/multi-select";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import { MultiSelect } from "#/ui/multi-select";
import { getCurrentTab, isControllableTab } from "@/lib/currentTab";

const model = defineModel<number[]>({ required: true });

const { t } = useI18n();
const tabs = ref<Browser.tabs.Tab[]>([]);
const tabsLoaded = ref(false);
const currentTabIsControllable = ref(false);
const currentTabGroupId = ref<number>();
let lastTabsQueryAt = 0;

const selectedValues = computed({
  get: () => model.value.map(String),
  set: (values: string[]) => {
    model.value = values
      .map(Number)
      .filter(Number.isSafeInteger);
  },
});

const options = computed<Option[]>(() => {
  const openTabsById = new Map(
    tabs.value.flatMap(tab => tab.id === undefined ? [] : [[tab.id, tab] as const]),
  );
  const result: Option[] = tabs.value.flatMap((tab) => {
    if (tab.id === undefined) {
      return [];
    }
    return [{
      value: String(tab.id),
      label: getTabTitle(tab),
      tagLabel: getTabTitle(tab),
      icon: tab.favIconUrl,
      fallbackIcon: "i-lucide-panels-top-left",
      tooltip: getTabTitle(tab),
      tooltipClass: "max-w-80 whitespace-normal wrap-anywhere",
    }];
  });

  for (const tabId of model.value) {
    if (!openTabsById.has(tabId)) {
      result.push({
        value: String(tabId),
        label: t("condition.tabIds.unavailableTab"),
        fallbackIcon: "i-lucide-panels-top-left",
        tooltip: t("condition.tabIds.unavailableTab"),
      });
    }
  }
  return result;
});

function getTabTitle(tab: Browser.tabs.Tab) {
  return tab.title?.trim()
    || tab.url
    || t("condition.tabIds.untitledTab");
}

async function refreshTabs(force = false) {
  const now = Date.now();
  if (!force && now - lastTabsQueryAt < 1000) {
    return;
  }
  lastTabsQueryAt = now;
  try {
    const [queriedTabs, currentTab] = await Promise.all([
      browser.tabs.query({}),
      getCurrentTab(),
    ]);
    tabs.value = queriedTabs
      .filter(isControllableTab)
      .sort((a, b) => a.windowId - b.windowId || a.index - b.index);
    currentTabIsControllable.value = currentTab !== undefined && isControllableTab(currentTab);
    currentTabGroupId.value = currentTab?.groupId;
  } finally {
    tabsLoaded.value = true;
  }
}

async function refreshTab(value: string) {
  const tabId = Number(value);
  if (!Number.isSafeInteger(tabId)) {
    return;
  }
  try {
    const tab = await browser.tabs.get(tabId);
    const index = tabs.value.findIndex(item => item.id === tabId);
    if (!isControllableTab(tab)) {
      if (index !== -1) {
        tabs.value.splice(index, 1);
      }
      return;
    }
    if (index === -1) {
      tabs.value.push(tab);
    } else {
      tabs.value[index] = tab;
    }
  } catch {
    tabs.value = tabs.value.filter(tab => tab.id !== tabId);
  }
}

function replaceWithTabs(selectedTabs: Browser.tabs.Tab[]) {
  model.value = [...new Set(
    selectedTabs.filter(isControllableTab).map(tab => tab.id),
  )];
  refreshTabs(true);
}

async function useCurrentWindow() {
  replaceWithTabs(await browser.tabs.query({ currentWindow: true }));
}

async function useCurrentGroup() {
  const currentTab = await getCurrentTab();
  if (!currentTab) {
    replaceWithTabs([]);
    return;
  }

  // Ungrouped tabs all share groupId -1. Treat the active ungrouped tab as its
  // own selection instead of unexpectedly selecting every ungrouped tab.
  if (currentTab.groupId === undefined || currentTab.groupId === -1) {
    replaceWithTabs([currentTab]);
    return;
  }

  replaceWithTabs(await browser.tabs.query({
    windowId: currentTab.windowId,
    groupId: currentTab.groupId,
  }));
}

async function useCurrentTab() {
  const currentTab = await getCurrentTab();
  replaceWithTabs(currentTab ? [currentTab] : []);
}

onMounted(() => refreshTabs(true));
</script>

<template>
  <div
    class="flex min-w-0 flex-1 items-center gap-1"
    @pointerenter="refreshTabs()"
  >
    <MultiSelect
      v-model="selectedValues"
      class="min-w-0 flex-1"
      :loading="!tabsLoaded"
      :options
      :placeholder="t('condition.tabIds.selectPlaceholder')"
      @option-hover="refreshTab"
    />
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          size="icon-xs"
          variant="secondary"
          :disabled="!currentTabIsControllable"
          :aria-label="t('condition.tabIds.quickSelect')"
        >
          <i class="i-lucide-chevrons-down-up size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="min-w-44" :collision-padding="8">
        <DropdownMenuItem @click="useCurrentTab">
          {{ t("condition.tabIds.useCurrentTab") }}
        </DropdownMenuItem>
        <DropdownMenuItem
          :disabled="currentTabGroupId === undefined || currentTabGroupId === -1"
          @click="useCurrentGroup"
        >
          {{ t("condition.tabIds.useCurrentGroup") }}
        </DropdownMenuItem>
        <DropdownMenuItem @click="useCurrentWindow">
          {{ t("condition.tabIds.useCurrentWindow") }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
