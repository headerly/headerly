export async function ensureCookiesPermission() {
  const hasCookiesPermission = await browser.permissions.contains({ permissions: ["cookies"] });
  if (hasCookiesPermission) {
    return true;
  }

  return await browser.permissions.request({ permissions: ["cookies"] });
}
