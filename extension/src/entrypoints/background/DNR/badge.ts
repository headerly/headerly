import { usePowerOnStorage } from "@/lib/storage";

export async function updateBadgeCount() {
  const registeredRules = await browser.declarativeNetRequest.getDynamicRules();
  const registeredRuleCount = registeredRules.length;
  if (registeredRuleCount > 0) {
    await Promise.all([
      browser.action.setBadgeTextColor({ color: "white" }),
      browser.action.setBadgeBackgroundColor({ color: "orange" }),
      browser.action.setBadgeText({ text: String(registeredRuleCount) }),
      setDefaultIcon(),
    ]);
  } else {
    await Promise.all([
      browser.action.setBadgeText({ text: "" }),
      setGrayscaleIcon(),
    ]);
  }
}

export async function setIconAndBadgeForDisabled() {
  await Promise.all([
    browser.action.setBadgeTextColor({ color: "white" }),
    browser.action.setBadgeBackgroundColor({ color: "gray" }),
    browser.action.setBadgeText({ text: "❚❚" }),
    setGrayscaleIcon(),
  ]);
}

const ICON_SIZE = 32;

function getIconPath() {
  return `/${browser.runtime.getManifest().icons![ICON_SIZE]!}`;
}

function setDefaultIcon() {
  return browser.action.setIcon({ path: getIconPath() });
}

async function setGrayscaleIcon() {
  const iconPath = getIconPath();
  const response = await fetch(iconPath);
  const imageBitmap = await createImageBitmap(await response.blob());
  const canvas = new OffscreenCanvas(ICON_SIZE, ICON_SIZE);
  const context = canvas.getContext("2d")!;
  context.filter = "grayscale(100%)";
  context.drawImage(imageBitmap, 0, 0);
  const imageData = context.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
  await browser.action.setIcon({ imageData });
}

export async function updateBadgeWhenRestarted() {
  const powerOn = await usePowerOnStorage().item.getValue();
  if (powerOn) {
    await updateBadgeCount();
  } else {
    await setIconAndBadgeForDisabled();
  }
}
