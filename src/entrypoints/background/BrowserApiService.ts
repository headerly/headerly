import { defineProxyService } from "@webext-core/proxy-service";

class BrowserApiService {

}
export const [registerBrowserApiService, getBrowserApiService] = defineProxyService(
  "BrowserApiService",
  () => new BrowserApiService(),
);
