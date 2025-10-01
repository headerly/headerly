import { defineProxyService } from "@webext-core/proxy-service";

class BrowserApiService {
  openPopupInNewtab() {
    browser.tabs.create({ url: "popup.html" });
  }
}
export const [registerBrowserApiService, getBrowserApiService] = defineProxyService(
  "BrowserApiService",
  () => new BrowserApiService(),
);
