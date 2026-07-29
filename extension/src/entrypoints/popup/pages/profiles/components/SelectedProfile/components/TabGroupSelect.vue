<script setup lang="ts">
import type { Option } from "#/ui/multi-select";
import type { TabGroupBinding } from "@/lib/schema";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { MultiSelect } from "#/ui/multi-select";

const model = defineModel<TabGroupBinding[]>({ required: true });

const { t } = useI18n();
const groups = ref<Browser.tabGroups.TabGroup[]>([]);
const tabs = ref<Browser.tabs.Tab[]>([]);
const groupsLoaded = ref(false);

const colorIconClasses = {
  blue: "i-lucide-circle fill-current text-blue-500",
  cyan: "i-lucide-circle fill-current text-cyan-500",
  green: "i-lucide-circle fill-current text-green-500",
  grey: "i-lucide-circle fill-current text-zinc-500",
  orange: "i-lucide-circle fill-current text-orange-500",
  pink: "i-lucide-circle fill-current text-pink-500",
  purple: "i-lucide-circle fill-current text-purple-500",
  red: "i-lucide-circle fill-current text-red-500",
  yellow: "i-lucide-circle fill-current text-yellow-500",
} as const satisfies Record<Browser.tabGroups.TabGroup["color"], string>;

const tabsByGroupId = computed(() => Map.groupBy(
  tabs.value
    .filter(tab => tab.id !== undefined && tab.groupId !== undefined)
    .sort((a, b) => a.index - b.index),
  tab => tab.groupId!,
));

const selectedGroupIds = computed({
  get: () => model.value.map(binding => binding.groupId),
  set: (groupIds: number[]) => {
    model.value = groupIds.map(groupId => ({
      groupId,
      tabIds: (tabsByGroupId.value.get(groupId) ?? []).flatMap(tab => tab.id === undefined ? [] : [tab.id]),
    }));
  },
});

const options = computed<Option<number>[]>(() => {
  const openGroupIds = new Set(groups.value.map(group => group.id));
  const result: Option<number>[] = groups.value.map(group => ({
    value: group.id,
    label: getGroupTitle(group),
    tagLabel: getGroupTitle(group),
    fallbackIcon: colorIconClasses[group.color],
    tooltip: getGroupTitle(group),
    tooltipClass: "max-w-80 whitespace-normal wrap-anywhere",
  }));

  for (const binding of model.value) {
    if (!openGroupIds.has(binding.groupId)) {
      result.push({
        value: binding.groupId,
        label: t("condition.tabGroups.unavailableGroup"),
        fallbackIcon: "i-lucide-circle-dashed text-muted-foreground",
        tooltip: t("condition.tabGroups.unavailableGroup"),
        tooltipClass: "max-w-80 whitespace-normal wrap-anywhere",
      });
    }
  }

  return result;
});

function getGroupTitle(group: Browser.tabGroups.TabGroup) {
  const title = group.title?.trim();
  if (title) {
    return title;
  }

  const groupTabs = tabsByGroupId.value.get(group.id) ?? [];
  const firstTab = groupTabs[0];
  const firstTabTitle = firstTab?.title?.trim()
    || firstTab?.url
    || t("condition.tabIds.untitledTab");
  const remainingCount = Math.max(0, groupTabs.length - 1);
  return t("condition.tabGroups.unnamedGroupLabel", {
    tabTitle: firstTabTitle,
    remainingCount,
  }, remainingCount);
}

async function refreshGroups() {
  try {
    const [queriedGroups, queriedTabs] = await Promise.all([
      browser.tabGroups.query({}),
      browser.tabs.query({}),
    ]);
    tabs.value = queriedTabs;
    groups.value = queriedGroups.sort((a, b) => {
      const firstTabA = queriedTabs.find(tab => tab.groupId === a.id);
      const firstTabB = queriedTabs.find(tab => tab.groupId === b.id);
      return a.windowId - b.windowId || (firstTabA?.index ?? 0) - (firstTabB?.index ?? 0);
    });
    selectedGroupIds.value = selectedGroupIds.value.filter(groupId =>
      queriedGroups.some(group => group.id === groupId),
    );
  } finally {
    groupsLoaded.value = true;
  }
}

onMounted(() => refreshGroups());
</script>

<template>
  <MultiSelect
    v-model="selectedGroupIds"
    class="min-w-0 flex-1"
    :loading="!groupsLoaded"
    :options
    :placeholder="t('condition.tabGroups.selectPlaceholder')"
  />
</template>
