import type { Theme } from "../constants/themes";
import { defineStore } from "pinia";
import { usePowerOnStorage, useThemeStorage } from "@/lib/storage";

export const useSettingsStore = defineStore("settings", {
  state: () => {
    const { ref: powerOn } = usePowerOnStorage();
    const { ref: theme } = useThemeStorage();
    return {
      powerOn,
      theme,
    };
  },
  actions: {
    togglePower() {
      this.powerOn = !this.powerOn;
    },
    setTheme(theme: Theme) {
      this.theme = theme;
    },
  },
});
