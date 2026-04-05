import type { Ref } from "vue";
import { computed } from "vue";
import { z } from "zod";
import { profileWithoutIdsZodSchema } from "@/lib/schema";

const profilesWithoutIdArraySchema = z.array(profileWithoutIdsZodSchema).min(1);

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
      return profilesWithoutIdArraySchema.safeParse(parsed).success;
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
