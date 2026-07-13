import type { KeybindingHandler } from "tinykeys";
import { parseKeybinding, tinykeys } from "tinykeys";
import { match } from "ts-pattern";
import { onUnmounted } from "vue";

export function useTinykeys(
  target: Window | HTMLElement,
  keybinding: string,
  handler: KeybindingHandler,
) {
  const stop = tinykeys(target, { [keybinding]: handler });
  onUnmounted(stop);

  const keys = parseKeybinding(keybinding).flatMap(([requiredModifiers, optionalModifiers, key]) => {
    if (key instanceof RegExp) {
      throw new TypeError("Regex keybindings are not supported");
    }

    return [
      ...requiredModifiers.map(formatKey),
      ...optionalModifiers.map(formatKey),
      formatKey(key),
    ];
  });
  return keys;
}

function formatKey(key: string) {
  return match(key)
    .with("Meta", () => "⌘")
    .with("Control", () => "Ctrl")
    .otherwise(value => value);
}
