import type { Profile } from "@/lib/schema";
import type { ActionType } from "@/lib/types";
import { match } from "ts-pattern";

export function findHeaderModGroups(profile: Profile, type: ActionType) {
  return match(type)
    .with("request", () => profile.requestHeaderModGroups)
    .with("response", () => profile.responseHeaderModGroups)
    .exhaustive();
}
