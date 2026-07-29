export async function ensureCookiesPermission() {
  const hasCookiesPermission = await browser.permissions.contains({ permissions: ["cookies"] });
  if (hasCookiesPermission) {
    return true;
  }

  return await browser.permissions.request({ permissions: ["cookies"] });
}

export async function ensureTabGroupsPermission() {
  const hasTabGroupsPermission = await browser.permissions.contains({ permissions: ["tabGroups"] });
  if (hasTabGroupsPermission) {
    return true;
  }

  return await browser.permissions.request({ permissions: ["tabGroups"] });
}
