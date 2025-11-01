import { categories } from "#/constants/emoji";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { setTheme } from "#/theme";
import { getModKey } from "@/lib/utils";

interface BaseSettingField {
  label: string;
  key: keyof ReturnType<typeof useSettingsStore>;
}

interface SelectField extends BaseSettingField {
  options: readonly { label: string; value: string }[];
  type: "select";
  onChange?: (e: Event) => void;
}

interface CheckboxField extends BaseSettingField {
  type: "checkbox";
  onChange?: (e: Event) => void;
}

type SettingField = SelectField | CheckboxField;

interface SettingGroup {
  fieldsetTitle: string;
  fields: readonly SettingField[];
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
          { label: "System", value: "system" },
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
        ],
        key: "theme",
        onChange: setTheme,
      },
      {
        type: "select",
        label: "Language",
        options: [
          { label: "English", value: "en-US" },
          { label: "Simplified Chinese", value: "zh-CN" },
          { label: "Japanese", value: "ja" },
        ],
        key: "language",
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
    ],
  },
] as const satisfies SettingGroup[];
