import { sendMessage } from "./background/message";

export default defineContentScript({
  matches: ["https://headerly.dev/share*"],
  main() {
    sendMessage("openSharedProfilesImport", window.location.search);
  },
});
