import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const macRegex = /Macintosh;/;
export function getModKey() {
  const isMac = navigator.userAgent.match(macRegex);
  return isMac ? "⌘" : "Ctrl";
}
