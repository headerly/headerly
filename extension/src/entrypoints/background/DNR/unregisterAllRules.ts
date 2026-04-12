import { useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage, useProfileId2RuleScopeRecordStorage } from "@/lib/storage";
import { sendMessage } from "../message";
import { logReceivingEndDoesNotExistOtherError } from "./util";

const { item: profileId2ErrorMessageRecordItem } = useProfileId2ErrorMessageRecordStorage();
const { item: profileId2RelatedRuleIdRecordItem } = useProfileId2RelatedRuleIdRecordStorage();
const { item: profileId2RuleScopeRecordItem } = useProfileId2RuleScopeRecordStorage();

export async function unregisterAllRules() {
  const [dynamicRules, sessionRules] = await Promise.all([
    browser.declarativeNetRequest.getDynamicRules(),
    browser.declarativeNetRequest.getSessionRules(),
  ]);
  const dynamicRuleIds = dynamicRules.map(r => r.id);
  const sessionRuleIds = sessionRules.map(r => r.id);
  if (!dynamicRuleIds.length && !sessionRuleIds.length) {
    return;
  }
  await Promise.all([
    dynamicRuleIds.length > 0
      ? browser.declarativeNetRequest.updateDynamicRules({ removeRuleIds: dynamicRuleIds })
      : undefined,
    sessionRuleIds.length > 0
      ? browser.declarativeNetRequest.updateSessionRules({ removeRuleIds: sessionRuleIds })
      : undefined,
  ]);

  try {
    await sendMessage("unregisterAllRules");
  } catch (error) {
    logReceivingEndDoesNotExistOtherError(error);
    profileId2ErrorMessageRecordItem.setValue({});
    profileId2RelatedRuleIdRecordItem.setValue({});
    profileId2RuleScopeRecordItem.setValue({});
  }
}
