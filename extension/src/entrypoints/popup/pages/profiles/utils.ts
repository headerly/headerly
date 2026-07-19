import type { Profile } from "@/lib/schema";
import type { ActionType } from "@/lib/types";

export function findHeaderModGroups(profile: Profile, type: ActionType) {
  return type === "request" ? profile.requestHeaderModGroups : profile.responseHeaderModGroups;
}
