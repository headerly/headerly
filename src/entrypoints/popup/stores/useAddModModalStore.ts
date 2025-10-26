import { defineStore } from "pinia";
import { ref } from "vue";

export const useAddModModalStore = defineStore("add-mod-modal", () => {
  const isOpen = ref(false);
  const currentTab = ref<"actions" | "conditions">("actions");
  return {
    isOpen,
    currentTab,
  };
});
