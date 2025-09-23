import type { Theme } from "../constants/themes";
import { defineStore } from "pinia";
import { useBrowserStorage } from "../hooks/useBrowserStorage";

interface UserSettings {
  powerOn: boolean;
  theme: Theme;
}

export const useSettingsStore = defineStore("settings", {
  state: () => {
    const powerOn = useBrowserStorage<UserSettings["powerOn"]>("local:powerOn", true);
    const theme = useBrowserStorage<UserSettings["theme"]>("local:theme", "light");
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
