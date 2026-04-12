export function logReceivingEndDoesNotExistOtherError(error: unknown): boolean {
  const result = error instanceof Error && error.message === "Could not establish connection. Receiving end does not exist.";
  if (!result) {
    console.error("Failed to send data to extension page:", error);
  }
  return result;
}

export async function updateBadgeCount() {
  const [dynamicRules, sessionRules] = await Promise.all([
    browser.declarativeNetRequest.getDynamicRules(),
    browser.declarativeNetRequest.getSessionRules(),
  ]);
  const registeredRuleCount = dynamicRules.length + sessionRules.length;
  if (registeredRuleCount > 0) {
    browser.action.setBadgeTextColor({ color: "white" });
    browser.action.setBadgeBackgroundColor({ color: "orange" });
    browser.action.setBadgeText({ text: String(registeredRuleCount) });
  } else {
    browser.action.setBadgeText({ text: "" });
  }
}
