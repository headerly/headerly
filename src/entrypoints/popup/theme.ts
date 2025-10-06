import { useThemeStorage } from "@/lib/storage";

export async function setTheme() {
  const { item } = useThemeStorage();
  const theme = await item.getValue();
  if (theme === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme!);
  }
}
