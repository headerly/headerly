import type { Profile, ProfileGroup } from "./schema";

export type ActionType = "request" | "response";
export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];
export interface ProfileManager {
  /**
   * Profile groups currently carry UI-only state and do not need to be shared across extension
   * entrypoints. Keeping them here preserves the option to manipulate groups directly from the
   * background in the future and makes undo/redo straightforward by storing groups and profiles
   * in the same state snapshot.
   */
  profileGroups: ProfileGroup[];
  profiles: Profile[];
  selectedProfileId: string;
}
