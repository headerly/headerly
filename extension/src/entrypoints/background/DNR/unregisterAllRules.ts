import { useProfileId2ErrorMessageRecordStorage, useProfileId2RelatedRuleIdRecordStorage } from "@/lib/storage";

const { item: profileId2ErrorMessageRecordItem } = useProfileId2ErrorMessageRecordStorage();
const { item: profileId2RelatedRuleIdRecordItem } = useProfileId2RelatedRuleIdRecordStorage();

export async function unregisterAllRules() {
  const [dynamicRules, sessionRules] = await Promise.all([
    browser.declarativeNetRequest.getDynamicRules(),
    browser.declarativeNetRequest.getSessionRules(),
  ]);
  const operations: Promise<unknown>[] = [];
  if (dynamicRules.length > 0) {
    operations.push(browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: dynamicRules.map(rule => rule.id),
    }));
  }
  if (sessionRules.length > 0) {
    operations.push(browser.declarativeNetRequest.updateSessionRules({
      removeRuleIds: sessionRules.map(rule => rule.id),
    }));
  }
  await Promise.all(operations);
  await Promise.all([
    profileId2ErrorMessageRecordItem.setValue({}),
    profileId2RelatedRuleIdRecordItem.setValue({}),
  ]);
}
