import { defineStore } from "pinia";
import {
  useAutoAssignEmojiStorage,
  useLanguageStorage,
  usePowerOnStorage,
  useRandomEmojiCategoryStorage,
  useThemeStorage,
} from "@/lib/storage";

export const useSettingsStore = defineStore("settings", {
  state: () => {
    const { ref: powerOn } = usePowerOnStorage();
    const { ref: language } = useLanguageStorage();
    const { ref: theme } = useThemeStorage();
    const { ref: autoAssignEmoji } = useAutoAssignEmojiStorage();
    const { ref: randomEmojiCategory } = useRandomEmojiCategoryStorage();
    return {
      powerOn,
      language,
      theme,
      autoAssignEmoji,
      randomEmojiCategory,
    };
  },
});
