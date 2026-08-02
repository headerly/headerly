export async function ensureBrowserPermission(permission: Browser.runtime.ManifestOptionalPermission): Promise<boolean> {
  const hasPermission = await browser.permissions.contains({ permissions: [permission] });
  if (hasPermission) {
    return true;
  }

  return await browser.permissions.request({ permissions: [permission] });
}
