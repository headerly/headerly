import { registerBrowserApiService } from "./BrowserApiService";

export default defineBackground({
  type: "module",
  main() {
    registerBrowserApiService();
  },
});
