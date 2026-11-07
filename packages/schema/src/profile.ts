import { z } from "zod";
import {
  headerModGroupSchema,
  redirectUrlGroupItemSchema,
  ruleActionTypeSchema,
  syncCookieGroupSchema,
  uuidSchemaWithDefault,
} from "./base.ts";
import { filterSchema } from "./filters.ts";

export const profileSchema = z.object({
  id: uuidSchemaWithDefault,
  name: z.string(),
  enabled: z.boolean(),
  emoji: z.string(),
  groupId: z.uuid().optional(),
  comments: z.string().optional(),
  ruleActionType: ruleActionTypeSchema,
  priority: z.int().min(1).optional().meta({ description: "Higher numbers take precedence. Defaults to 1 when omitted; Chrome accepts integers from 1 to 2147483647." }),
  requestHeaderModGroups: z.array(headerModGroupSchema).optional().meta({ description: "For modifyHeaders. Header names and values are trimmed; blank names or set/append values are ignored." }),
  responseHeaderModGroups: z.array(headerModGroupSchema).optional(),
  syncCookieGroups: z.array(syncCookieGroupSchema).optional().meta({ description: "Requires cookie permission. Values are cleared on export and refreshed from local cookies after import; empty values are ignored. Profile filters determine the destination, not the source cookie scope." }),
  redirectUrlGroup: z.array(redirectUrlGroupItemSchema).optional().meta({ description: "Fixed destinations for redirect. Uses the first enabled entry after trimming its URL. Other entries are retained but not applied." }),
  filters: filterSchema,
});
