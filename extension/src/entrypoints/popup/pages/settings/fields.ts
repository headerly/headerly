import type { BasicColorSchema } from "@vueuse/core";
import { categories } from "@/entrypoints/popup/constants/emoji";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { getModKey } from "@/lib/utils";

interface BaseSettingField {
  label: string;
  key: keyof ReturnType<typeof useSettingsStore>;
  description?: string;
}

interface SelectField extends BaseSettingField {
  options: readonly { label: string; value: string }[];
  type: "select";
  onChange?: (v: string) => void;
}

interface CheckboxField extends BaseSettingField {
  type: "checkbox";
  onChange?: (e: Event) => void;
}

type SettingField = SelectField | CheckboxField;

interface SettingGroup {
  fieldsetTitle: string;
  fields: SettingField[];
  anchor: string;
  anchorIcon: string;
}

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
export const settings = [
  {
    fieldsetTitle: "Appearance",
    anchor: "appearance",
    anchorIcon: "i-lucide-aperture",
    fields: [
      {
        type: "select",
        label: "Theme",
        options: [
          { label: "Auto", value: "auto" },
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
        ] satisfies { label: string; value: BasicColorSchema }[],
        key: "theme",
      },
      {
        type: "checkbox",
        label: "Display the badges for numbers 1-9 in the sidebar",
        key: "displayNumberBadge",
      },
      {
        type: "checkbox",
        label: "Automatically assign emoji to new profiles",
        key: "autoAssignEmoji",
      },
      {
        type: "select",
        label: "Category for random emoji assignment",
        options: categories,
        key: "randomEmojiCategory",
      },
    ],
  },
  {
    fieldsetTitle: "Shortcuts",
    anchor: "shortcuts",
    anchorIcon: "i-lucide-command",
    fields: [
      {
        type: "checkbox",
        label: `Enable ${getModKey()} + 1-9 to switch between profiles`,
        key: "enableMetaNumberShortcut",
      },
      {
        type: "checkbox",
        label: `Enable ${getModKey()} + K to search for profiles`,
        key: "enableMetaKSearch",
      },
      {
        type: "checkbox",
        label: `Enable ${getModKey()} + Z / ${getModKey()} + Shift + Z for undo/redo actions`,
        key: "enableUndoAndRedoShortcut",
      },
    ],
  },
  {
    fieldsetTitle: "Profiles",
    anchor: "profiles",
    anchorIcon: "i-lucide-code-xml",
    fields: [
      {
        type: "select",
        label: "Switch mode",
        options: [
          { label: "Multiple", value: "multiple" },
          { label: "Single", value: "single" },
        ],
        description: "In single mode, you can enable only one profile at a time, and switching profiles automatically enables the one you select.",
        key: "switchMode",
        onChange: () => {
          if (settingsStore.switchMode === "single") {
            profilesStore.selectedProfile.enabled = true;
            profilesStore.manager.profiles.forEach((profile) => {
              if (profile.id !== profilesStore.selectedProfile.id) {
                profile.enabled = false;
              }
            });
          }
        },
      },
      {
        type: "checkbox",
        label: "Use native DNR resource type behavior",
        key: "nativeResourceTypeBehavior",
        description: "Resource type defaults to 'all', but enabling this option will not set it to 'all', and rules without a resource type condition will match only a narrower range of requests.",
      },
    ],
  },
] satisfies SettingGroup[];
