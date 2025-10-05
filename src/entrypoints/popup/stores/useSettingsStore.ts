import { defineStore } from "pinia";
import { computed } from "vue";
import {
  useAutoAssignEmojiStorage,
  useLanguageStorage,
  usePowerOnStorage,
  useRandomEmojiCategoryStorage,
  useThemeStorage,
} from "@/lib/storage";

export const useSettingsStore = defineStore("settings", () => {
  const powerOn = usePowerOnStorage();
  const language = useLanguageStorage();
  const theme = useThemeStorage();
  const autoAssignEmoji = useAutoAssignEmojiStorage();
  const randomEmojiCategory = useRandomEmojiCategoryStorage();

  const isModified = computed(() => {
    return (
      powerOn.ref.value !== powerOn.initialValue
      || language.ref.value !== language.initialValue
      || theme.ref.value !== theme.initialValue
      || autoAssignEmoji.ref.value !== autoAssignEmoji.initialValue
      || randomEmojiCategory.ref.value !== randomEmojiCategory.initialValue
    );
  });
  return {
    powerOn: powerOn.ref,
    language: language.ref,
    theme: theme.ref,
    autoAssignEmoji: autoAssignEmoji.ref,
    randomEmojiCategory: randomEmojiCategory.ref,
    isModified,
    resetToDefault: () => {
      powerOn.ref.value = powerOn.initialValue;
      language.ref.value = language.initialValue;
      theme.ref.value = theme.initialValue;
      autoAssignEmoji.ref.value = autoAssignEmoji.initialValue;
      randomEmojiCategory.ref.value = randomEmojiCategory.initialValue;
    },
  };
});
