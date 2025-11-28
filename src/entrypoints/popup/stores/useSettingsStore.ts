import { useColorMode } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed } from "vue";
import {
  useAutoAssignEmojiStorage,
  useDisplayNumberBadgeStorage,
  useEnableMetaKSearchStorage,
  useEnableMetaNumberShortcutStorage,
  useEnableUndoAndRedoShortcutStorage,
  useNativeResourceTypeBehaviorStorage,
  usePowerOnStorage,
  useRandomEmojiCategoryStorage,
  useSwitchModeStorage,
} from "@/lib/storage";

export const useSettingsStore = defineStore("settings", () => {
  const theme = useColorMode({
    attribute: "data-theme",
    emitAuto: true,
  });
  const storageConfigs = {
    powerOn: usePowerOnStorage(),
    autoAssignEmoji: useAutoAssignEmojiStorage(),
    randomEmojiCategory: useRandomEmojiCategoryStorage(),
    displayNumberBadge: useDisplayNumberBadgeStorage(),
    enableMetaNumberShortcut: useEnableMetaNumberShortcutStorage(),
    enableMetaKSearch: useEnableMetaKSearchStorage(),
    enableUndoAndRedoShortcut: useEnableUndoAndRedoShortcutStorage(),
    switchMode: useSwitchModeStorage(),
    nativeResourceTypeBehavior: useNativeResourceTypeBehaviorStorage(),
  } as const;

  const isModified = computed(() => {
    return Object.values(storageConfigs).some(
      config => config.ref.value !== config.initialValue,
    );
  });

  const resetToDefault = () => {
    Object.values(storageConfigs).forEach((config) => {
      config.ref.value = config.initialValue;
    });
  };

  const settings = Object.fromEntries(
    Object.entries(storageConfigs).map(([key, config]) => [key, config.ref]),
  ) as {
    [K in keyof typeof storageConfigs]: (typeof storageConfigs)[K]["ref"]
  };

  return {
    ...settings,
    theme,
    isModified,
    resetToDefault,
  };
});
