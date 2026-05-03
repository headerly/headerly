import type { Ref } from "vue";
import { computed } from "vue";
import { profileExchangeZodSchema } from "@/lib/schema";

export function useJsonValidation(json: Ref<string>) {
  const validJson = computed(() => {
    try {
      JSON.parse(json.value);
      return true;
    } catch {
      return false;
    }
  });

  const validJsonSchema = computed(() => {
    try {
      const parsed = JSON.parse(json.value);
      return profileExchangeZodSchema.safeParse(parsed).success;
    } catch {
      return false;
    }
  });

  function formatJson() {
    const parsed = JSON.parse(json.value);
    return JSON.stringify(parsed, null, 2);
  }

  return { validJson, validJsonSchema, formatJson };
}
