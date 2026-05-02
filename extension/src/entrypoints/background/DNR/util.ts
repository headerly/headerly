export function logReceivingEndDoesNotExistOtherError(error: unknown): boolean {
  const result = error instanceof Error && error.message === "Could not establish connection. Receiving end does not exist.";
  if (!result) {
    console.error("Failed to send data to extension page:", error);
  }
  return result;
}

export async function updateBadgeCount() {
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

export function setIconAndBadgeForDisabled() {
  browser.action.setBadgeTextColor({ color: "white" });
  browser.action.setBadgeBackgroundColor({ color: "gray" });
  browser.action.setBadgeText({ text: "❚❚" });
  const SIZE = 32;
  const iconPath = `/${browser.runtime.getManifest().icons![SIZE]!}`;
  fetch(iconPath)
    .then(response => response.blob())
    .then(blob => createImageBitmap(blob))
    .then((imageBitmap) => {
      const canvas = new OffscreenCanvas(SIZE, SIZE);
      const context = canvas.getContext("2d")!;
      context.filter = "grayscale(100%)";
      context.drawImage(imageBitmap, 0, 0);
      const imageData = context.getImageData(0, 0, SIZE, SIZE);
      browser.action.setIcon({ imageData });
    });
}
