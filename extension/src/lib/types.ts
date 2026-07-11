import type { Profile, ProfileGroup } from "./schema";

export type ActionType = "request" | "response";
export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];
export interface ProfileManager {
  profiles: Profile[];
  profileGroups: ProfileGroup[];
  selectedProfileId: string;
}
