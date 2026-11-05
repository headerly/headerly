import { z } from "zod";
import {
  headerModGroupSchema,
  redirectUrlGroupItemSchema,
  ruleActionTypeSchema,
  syncCookieGroupSchema,
  uuidSchemaWithDefault,
} from "./base";
import { filterSchema } from "./filters";

export const profileSchema = z.object({
  id: uuidSchemaWithDefault,
  name: z.string(),
  enabled: z.boolean(),
  emoji: z.string(),
  groupId: z.uuid().optional(),
  comments: z.string().optional(),
  ruleActionType: ruleActionTypeSchema,
  priority: z.int().min(1).optional().meta({ description: "Range: 1 to 2^31 - 1, default: 1" }),
  requestHeaderModGroups: z.array(headerModGroupSchema).optional(),
  responseHeaderModGroups: z.array(headerModGroupSchema).optional(),
  syncCookieGroups: z.array(syncCookieGroupSchema).optional(),
  redirectUrlGroup: z.array(redirectUrlGroupItemSchema).optional(),
  filters: filterSchema,
});
