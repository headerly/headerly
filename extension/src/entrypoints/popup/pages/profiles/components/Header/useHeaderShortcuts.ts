import { useTinykeys } from "@/composables/useTinykeys";

interface UseHeaderShortcutsOptions {
  canRedo: () => boolean;
  canUndo: () => boolean;
  openAddRuleOptionDialog: () => void;
  openProfileSearch: () => void;
  redo: () => void;
  toggleProfile: () => void;
  undo: () => void;
}

function isTextInputFocused() {
  return document.activeElement?.matches("input, textarea, [contenteditable='true']");
}

export function useHeaderShortcuts(options: UseHeaderShortcutsOptions) {
  const profileSearchShortcutKeys = useTinykeys(window, "$mod+K", (event) => {
    event.preventDefault();
    options.openProfileSearch();
  });

  const undoShortcutKeys = useTinykeys(window, "$mod+Z", (event) => {
    if (isTextInputFocused() || !options.canUndo())
      return;

    event.preventDefault();
    options.undo();
  });

  const redoShortcutKeys = useTinykeys(window, "$mod+Shift+Z", (event) => {
    if (isTextInputFocused() || !options.canRedo())
      return;

    event.preventDefault();
    options.redo();
  });

  const toggleProfileShortcutKeys = useTinykeys(window, "$mod+P", (event) => {
    event.preventDefault();
    if (!event.repeat)
      options.toggleProfile();
  });

  const addRuleOptionShortcutKeys = useTinykeys(window, "$mod+A", (event) => {
    if (isTextInputFocused())
      return;

    event.preventDefault();
    if (!event.repeat)
      options.openAddRuleOptionDialog();
  });

  return {
    addRuleOptionShortcutKeys,
    profileSearchShortcutKeys,
    redoShortcutKeys,
    toggleProfileShortcutKeys,
    undoShortcutKeys,
  };
}
