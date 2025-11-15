import { useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";
import { sendMessage } from "../message";
import { logReceivingEndDoesNotExistOtherError } from "./util";

const { item: profileId2ErrorMessageRecordItem } = useProfileId2ErrorMessageRecordStorage();
const { item: profileId2RelatedRuleIdRecordItem } = useProfileId2RelatedRuleIdRecordStorage();

export async function unregisterAllRules() {
  const oldRules = await browser.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map(r => r.id);
  if (!oldRuleIds.length) {
    return;
  }
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
  });

  try {
    await sendMessage("unregisterAllRules");
  } catch (error) {
    logReceivingEndDoesNotExistOtherError(error);
    profileId2ErrorMessageRecordItem.setValue({});
    profileId2RelatedRuleIdRecordItem.setValue({});
  }
}
