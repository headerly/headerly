import { expect } from "vitest";
import { z } from "zod";
import { editorText } from "../test-util";

export async function exportedJson(page: Parameters<typeof editorText>[0]) {
  await expect.poll(() => editorText(page)).toContain("Portable profile");
  // CodeMirror virtualizes long documents; read the full payload through the public copy action.
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value: string) => window.e2eClipboard = value },
    });
  });
  await page.getByTestId("export-menu-trigger").click();
  await page.getByTestId("export-copy-json").click();
  const json = await page.evaluate(() => window.e2eClipboard);
  return z.object({
    items: z.array(z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("profile"), profile: z.record(z.string(), z.unknown()) }),
      z.looseObject({
        kind: z.literal("group"),
        name: z.string(),
        color: z.string(),
        type: z.enum(["radio", "checkbox"]),
        profiles: z.array(z.record(z.string(), z.unknown())),
      }),
    ])),
    version: z.number(),
  }).parse(JSON.parse(json));
}
