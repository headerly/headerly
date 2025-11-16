import type { Theme } from "@/lib/storage";
import { useThemeStorage } from "@/lib/storage";

export async function initializeTheme() {
  const { item } = useThemeStorage();
  const theme = await item.getValue();
  handleThemeChange(theme);
}

export function handleThemeChange(newTheme: Theme) {
  if (newTheme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", newTheme);
  }
}
