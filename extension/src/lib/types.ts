import type { Profile, ProfileGroup } from "./schema";

export type ActionType = "request" | "response";
export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];
export interface ProfileManager {
  // Optional for backward compatibility with v1 storage. The v2 migration always populates this
  // field so groups share the same state snapshot as profiles and support undo and redo.
  profileGroups?: ProfileGroup[];
  profiles: Profile[];
  selectedProfileId: string;
}
