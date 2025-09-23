import { defineStore } from "pinia";
import { useBrowserStorage } from "../hooks/useBrowserStorage";

interface UserSettings {
  powerOn: boolean;
}

export const useSettingsStore = defineStore("settings", {
  state: () => {
    const powerOn = useBrowserStorage<UserSettings["powerOn"]>("local:powerOn", true);
    return {
      powerOn,
    };
  },
  actions: {
    togglePower() {
      this.powerOn = !this.powerOn;
    },
  },
});
