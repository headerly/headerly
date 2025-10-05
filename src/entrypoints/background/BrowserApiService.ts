import { defineProxyService } from "@webext-core/proxy-service";

class BrowserApiService {
  openInFullscreen() {
    browser.tabs.create({ url: browser.runtime.getURL("/popup.html") });
  }
}
export const [registerBrowserApiService, getBrowserApiService] = defineProxyService(
  "BrowserApiService",
  () => new BrowserApiService(),
);
