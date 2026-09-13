import type { ComputedRef, InjectionKey } from "vue";
import { computed, inject } from "vue";

export interface UiLabels {
  close: string;
  loading: string;
  selectOptions: string;
  clearAll: string;
  noResultsFound: string;
}

export const uiLabelsKey: InjectionKey<ComputedRef<UiLabels>> = Symbol("ui-labels");

export function useUiLabels() {
  return inject(uiLabelsKey, computed(() => ({
    close: "Close",
    loading: "Loading",
    selectOptions: "Select options",
    clearAll: "Clear all",
    noResultsFound: "No results found.",
  })));
}
