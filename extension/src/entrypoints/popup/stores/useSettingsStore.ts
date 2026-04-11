import { useColorMode } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed } from "vue";
import {
  useAutoAssignEmojiStorage,
  useNativeResourceTypeBehaviorStorage,
  usePowerOnStorage,
  useRandomEmojiCategoryStorage,
} from "@/lib/storage";

export const useSettingsStore = defineStore("settings", () => {
  const theme = useColorMode({
    emitAuto: true,
  });
  const storageConfigs = {
    powerOn: usePowerOnStorage(),
    autoAssignEmoji: useAutoAssignEmojiStorage(),
    randomEmojiCategory: useRandomEmojiCategoryStorage(),
    nativeResourceTypeBehavior: useNativeResourceTypeBehaviorStorage(),
  } as const;

  const isModified = computed(() => {
    return Object.values(storageConfigs).some(
      config => config.ref.value !== config.initialValue,
    ) || theme.value !== "auto";
  });

  const resetToDefault = () => {
    Object.values(storageConfigs).forEach((config) => {
      config.ref.value = config.initialValue;
    });
    theme.value = "auto";
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
