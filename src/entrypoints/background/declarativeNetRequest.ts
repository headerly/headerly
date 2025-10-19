// import type { UUID } from "node:crypto";
// import type { HeaderMod, Profile } from "@/lib/storage";

// const INVALID_LEVEL = {
//   /**
//    * Various empty states, such as disable, empty array, empty string, etc., result in "no data" and no rule will be created for them.
//    * Do not remind the user.
//    */
//   IGNORED: 0,
//   /**
//    * Indicates that creating a rule with this data will result in an error being thrown.
//    * Remind the user to modify it.
//    */
//   ERROR: 1,
// } as const;

// type InvalidLevel = typeof INVALID_LEVEL[keyof typeof INVALID_LEVEL];
// interface JudgeResult {
//   valid: boolean;
//   level?: InvalidLevel;
//   message?: string;
// }
// export async function judgeRegexFilterValid(regex: string): Promise<JudgeResult> {
//   if (regex === "") {
//     return {
//       valid: false,
//       level: INVALID_LEVEL.IGNORED,
//       message: "Regex filter is empty.",
//     };
//   }
//   const { isSupported, reason } = await browser.declarativeNetRequest.isRegexSupported({ regex });
//   if (isSupported) {
//     return { valid: true };
//   }
//   if (reason === "memoryLimitExceeded") {
//     return {
//       valid: false,
//       level: INVALID_LEVEL.ERROR,
//       message: "The regular expression exceeds the memory limit.",
//     };
//   }
//   if (reason === "syntaxError") {
//     return {
//       valid: false,
//       level: INVALID_LEVEL.ERROR,
//       message: "The regular expression is syntactically incorrect, or uses features not available in the RE2 syntax.",
//     };
//   }
//   return {
//     valid: true,
//   };
// }

// export async function judgeProfileError(profile: Profile): Promise<JudgeResult> {
//   if (profile.filters.regexFilter?.enabled && profile.filters.regexFilter.value !== "") {
//     const { valid, level, message } = await judgeRegexFilterValid(profile.filters.regexFilter.value);
//     if (!valid && level !== INVALID_LEVEL.IGNORED) {
//       return { valid, level, message };
//     }
//   }
//   return { valid: true };
// }

// export function judgeModIsEnabledAndNotEmpty(mod: HeaderMod): boolean {
//   if (!mod.enabled) {
//     return false;
//   }
//   if (mod.operation !== "remove" && mod.name !== "" && mod.value !== "") {
//     return true;
//   }
//   if (mod.operation === "remove" && mod.name !== "") {
//     return true;
//   }
//   return false;
// }

// type CleanupProfile = Pick<Profile, "requestHeaderMods" | "responseHeaderMods" | "id"> & {
//   filters: Browser.declarativeNetRequest.RuleCondition;
// };
// export function cleanupProfile(profile: Profile): CleanupProfile | false {
//   if (!profile.enabled) {
//     return false;
//   }
//   const enabledAndNonEmptyRequestHeaderMods = profile.requestHeaderMods.filter(judgeModIsEnabledAndNotEmpty);
//   const enabledAndNonEmptyResponseHeaderMods = profile.responseHeaderMods.filter(judgeModIsEnabledAndNotEmpty);
//   const hasAtLeastOneEnabledAndNotEmptyMod = enabledAndNonEmptyRequestHeaderMods.length > 0 || enabledAndNonEmptyResponseHeaderMods.length > 0;
//   if (!hasAtLeastOneEnabledAndNotEmptyMod) {
//     return false;
//   }
//   const filters = {
//     urlFilter: profile.filters.urlFilter?.enabled && profile.filters.urlFilter.value !== "" ? profile.filters.urlFilter.value : undefined,
//     regexFilter: profile.filters.regexFilter?.enabled && profile.filters.regexFilter.value !== "" ? profile.filters.regexFilter.value : undefined,
//   };

//   return {
//     requestHeaderMods: enabledAndNonEmptyRequestHeaderMods,
//     responseHeaderMods: enabledAndNonEmptyResponseHeaderMods,
//     filters,
//     id: profile.id,
//   };
// }

// class ProfileUuidToRuleIdMap {
//   #uuidToId = new Map<UUID, number>();
//   #maxId = 0;

//   set(uuid: UUID): number {
//     if (this.#uuidToId.has(uuid)) {
//       return this.#uuidToId.get(uuid)!;
//     }
//     const newId = ++this.#maxId;
//     this.#uuidToId.set(uuid, newId);
//     return newId;
//   }
// }

// const profileIdToRuleIdMap = new ProfileUuidToRuleIdMap();
// function generateRule(profile: CleanupProfile): Browser.declarativeNetRequest.Rule {
//   const condition = {
//     urlFilter: profile.filters.urlFilter,
//     regexFilter: profile.filters.regexFilter,
//   } satisfies Browser.declarativeNetRequest.RuleCondition;
//   function generateModifyHeaderInfo(mods: HeaderMod[]): Browser.declarativeNetRequest.ModifyHeaderInfo[] {
//     return mods.map((mod) => {
//       if (mod.operation === "remove") {
//         return { header: mod.name, operation: mod.operation };
//       }

//       return { header: mod.name, value: mod.value!, operation: mod.operation };
//     });
//   }

//   const requestHeaders = generateModifyHeaderInfo(profile.requestHeaderMods);
//   const responseHeaders = generateModifyHeaderInfo(profile.responseHeaderMods);
//   const action = {
//     requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
//     responseHeaders: responseHeaders.length > 0 ? responseHeaders : undefined,
//     type: "modifyHeaders",
//   } satisfies Browser.declarativeNetRequest.RuleAction;
//   const ruleId = profileIdToRuleIdMap.set(profile.id);

//   return { condition, action, id: ruleId };
// }

// export async function registerExistingMods(profiles: Profile[]) {
//   const cleanedProfiles = profiles.map(cleanupProfile).filter(Boolean);
//   const newRules = cleanedProfiles.map(generateRule);
//   const oldRules = await browser.declarativeNetRequest.getDynamicRules();
//   const oldRuleIds = oldRules.map(r => r.id);
//   await browser.declarativeNetRequest.updateDynamicRules({
//     removeRuleIds: oldRuleIds,
//     addRules: newRules,
//   });
// }

// export async function unregisterAllMods() {
//   const oldRules = await browser.declarativeNetRequest.getDynamicRules();
//   const oldRuleIds = oldRules.map(r => r.id);
//   if (oldRuleIds.length > 0) {
//     await browser.declarativeNetRequest.updateDynamicRules({
//       removeRuleIds: oldRuleIds,
//     });
//   }
// }
