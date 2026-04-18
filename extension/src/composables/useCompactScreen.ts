import { useMediaQuery } from "@vueuse/core";

export function useCompactScreen() {
  return useMediaQuery("(max-width: 590px)");
}
