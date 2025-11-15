export function logReceivingEndDoesNotExistOtherError(error: unknown): boolean {
  const result = error instanceof Error && error.message === "Could not establish connection. Receiving end does not exist.";
  if (!result) {
    console.error("Failed to send data to extension page:", error);
  }
  return result;
}

export async function updateBadge() {
  const registeredRules = await browser.declarativeNetRequest.getDynamicRules();
  const registeredRuleCount = registeredRules.length;
  if (registeredRuleCount > 0) {
    browser.action.setBadgeTextColor({ color: "white" });
    browser.action.setBadgeBackgroundColor({ color: "orange" });
    browser.action.setBadgeText({ text: String(registeredRules.length) });
  } else {
    browser.action.setBadgeText({ text: "" });
  }
}
