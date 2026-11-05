import type { Ref } from "vue";
import type { z } from "zod";
import { computed } from "vue";
import { profileExchangeZodSchema } from "@/lib/schema";

export interface JsonValidationError {
  path: string;
  message: string;
}

function collectIssues(issues: z.core.$ZodIssue[], parentPath: PropertyKey[] = []): JsonValidationError[] {
  return issues.flatMap((issue) => {
    const issuePath = [...parentPath, ...issue.path];
    if (issue.code === "invalid_union" && issue.errors.length > 0)
      return issue.errors.flatMap(errors => collectIssues(errors, issuePath));

    const path = issuePath.reduce<string>((path, part) =>
      typeof part === "number" ? `${path}[${part}]` : `${path}.${String(part)}`, "$");
    return [{ path, message: issue.message }];
  });
}

export function useJsonValidation(json: Ref<string>) {
  const validation = computed(() => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json.value);
    } catch (error) {
      return {
        validJson: false,
        validJsonSchema: false,
        errors: [{ path: "$", message: error instanceof Error ? error.message : String(error) }],
      };
    }
    const result = profileExchangeZodSchema.safeParse(parsed);
    return {
      validJson: true,
      validJsonSchema: result.success,
      errors: result.success ? [] : collectIssues(result.error.issues),
    };
  });
  const validJson = computed(() => validation.value.validJson);
  const validJsonSchema = computed(() => validation.value.validJsonSchema);
  const validationErrors = computed(() => validation.value.errors);

  function formatJson() {
    const parsed = JSON.parse(json.value);
    return JSON.stringify(parsed, null, 2);
  }

  return { validJson, validJsonSchema, validationErrors, formatJson };
}
