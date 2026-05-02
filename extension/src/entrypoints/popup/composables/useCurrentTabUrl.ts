import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

export function useCurrentTabUrl() {
  const { data: currentUrl, isPending } = useQuery({
    queryKey: ["current-tab-url"],
    queryFn: async () => {
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!currentTab?.url) {
        return null;
      }
      return new URL(currentTab.url);
    },
  });

  const canUseCurrentUrl = computed(() => {
    if (isPending.value || !currentUrl.value) {
      return false;
    }
    return currentUrl.value.protocol === "http:" || currentUrl.value.protocol === "https:";
  });

  return {
    currentUrl,
    canUseCurrentUrl,
  };
}
