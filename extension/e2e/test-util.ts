import type { Frame, Page } from "playwright";
import type { Profile } from "../src/lib/schema";
import { uuidv7 } from "uuidv7";

export function group<T>(items: T[], type: "checkbox" | "radio" = "checkbox") {
  return { id: uuidv7(), items, type };
}

export function item<T>(value: T) {
  return { enabled: true, id: uuidv7(), value };
}

export function header(
  name: string,
  operation: "append" | "remove" | "set",
  value = "",
) {
  return operation === "remove"
    ? { enabled: true, id: uuidv7(), name, operation }
    : { enabled: true, id: uuidv7(), name, operation, value };
}

export function profile(overrides: Partial<Profile>): Profile {
  return {
    emoji: "🧪",
    enabled: true,
    filters: {},
    id: uuidv7(),
    name: "E2E guide profile",
    ruleActionType: "modifyHeaders",
    ...overrides,
  };
}

export async function fetchEcho(page: Frame | Page, url: string, options?: {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
}) {
  return await page.evaluate(async ({ options: requestOptions, url: requestUrl }) => {
    const response = await fetch(requestUrl, { cache: "no-store", ...requestOptions });
    if (!response.ok) {
      throw new Error(`Echo request failed: ${response.status} ${requestUrl}`);
    }
    return await response.json() as {
      headers: Record<string, string | undefined>;
      method: string;
      path: string;
    };
  }, { options, url });
}

export async function fetchResponseHeaders(page: Page, url: string) {
  return await page.evaluate(async (requestUrl) => {
    const response = await fetch(requestUrl, { cache: "no-store" });
    return Object.fromEntries(response.headers.entries());
  }, url);
}

export async function loadInspectionScript(page: Page, url: string) {
  return await page.evaluate(async (scriptUrl) => {
    window.e2eScriptHeader = undefined;
    const script = document.createElement("script");
    script.src = `${scriptUrl}?cache=${crypto.randomUUID()}`;
    try {
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${script.src}`));
        document.head.append(script);
      });
      return window.e2eScriptHeader;
    } finally {
      script.remove();
    }
  }, url);
}

export async function editorText(page: Page) {
  return await page.locator(".cm-content").evaluate(element => element.textContent ?? "");
}

export async function setEditorText(page: Page, text: string) {
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(text);
}

declare global {
  interface Window {
    e2eScriptHeader?: string | null;
  }
}
