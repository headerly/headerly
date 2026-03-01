import type { Profile } from "./schema";

export type ActionType = "request" | "response";
export type HeaderModOperation = Browser.declarativeNetRequest.ModifyHeaderInfo["operation"];
export interface ProfileManager {
  profiles: Profile[];
  selectedProfileId: string;
}
