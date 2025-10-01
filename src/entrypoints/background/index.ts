import { usePowerOnStorage, useProfileManagerStorage } from "@/lib/storage";
import { registerBrowserApiService } from "./BrowserApiService";
import { registerExistingMods } from "./declarativeNetRequest";

export default defineBackground({
  type: "module",
  main() {
    registerBrowserApiService();
    const { item: powerOnItem } = usePowerOnStorage();
    const { item: profileManagerItem } = useProfileManagerStorage();
    Promise.all([
      powerOnItem.getValue(),
      profileManagerItem.getValue(),
      // @ts-expect-error Remove after PR merge
      // https://github.com/wxt-dev/wxt/pull/1914
    ]).then(([powerOn, { profiles }]) => {
      if (powerOn) {
        registerExistingMods(profiles);
      }
    });
  },
});
