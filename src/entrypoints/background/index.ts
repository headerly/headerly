import { usePowerOnStorage, useProfileManagerStorage } from "@/lib/storage";
import { registerBrowserApiService } from "./BrowserApiService";
import { registerExistingMods, unregisterAllMods } from "./declarativeNetRequest";

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
      // TODO: https://github.com/wxt-dev/wxt/pull/1909
    ]).then(async ([powerOn, { profiles }]) => {
      const handlePowerOnChange = async (powerOn: boolean) => {
        if (powerOn) {
          await registerExistingMods(profiles);
        } else {
          await unregisterAllMods();
        }
      };
      await handlePowerOnChange(powerOn!);
      powerOnItem.watch(async (powerOn) => {
        await handlePowerOnChange(powerOn!);
      });

      profileManagerItem.watch(async (manager) => {
        if (await powerOnItem.getValue()) {
          await registerExistingMods(manager!.profiles);
        }
      });
    });
  },
});
