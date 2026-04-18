import { useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";

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

  await Promise.all([
    profileId2ErrorMessageRecordItem.setValue({}),
    profileId2RelatedRuleIdRecordItem.setValue({}),
  ]);
}
