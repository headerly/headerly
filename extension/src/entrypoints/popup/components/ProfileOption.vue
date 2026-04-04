<script setup lang="tsx">
import type { Profile } from "@/lib/schema";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { Button } from "#/ui/button";
import { Kbd } from "#/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { cn, getModKey } from "@/lib/utils";

const { profile, index, showShortcutHint = false } = defineProps<{
  profile: Profile;
  index: number;
  showShortcutHint?: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const settingsStore = useSettingsStore();
const profilesStore = useProfilesStore();

function renderShortcutHint(index: number) {
  if (!showShortcutHint || !settingsStore.enableMetaNumberShortcut || index >= 9) {
    return null;
  }
  return (
    <span>
      <Kbd class="mr-1">{getModKey()}</Kbd>
      <Kbd>{String(index + 1)}</Kbd>
    </span>
  );
}
</script>

<template>
  <Button
    size="icon-sm"
    :variant="profilesStore.manager.selectedProfileId === profile.id ? 'default' : 'secondary'"
    class="relative flex text-xl"
    @click="emit('click')"
  >
    <TooltipProvider ignore-non-keyboard-focus>
      <Tooltip>
        <TooltipTrigger as-child>
          <span
            :class="cn({ 'opacity-30': !profile.enabled })"
          >
            {{ profile.emoji }}
          </span>
          <span
            v-if="profilesStore.profileId2ErrorMessageRecord[profile.id] || profilesStore.profileId2RelatedRuleIdRecord[profile.id]"
            :class="cn(
              `
                absolute top-0 right-0 z-10 inline-block aspect-square size-2
                translate-x-1/2 -translate-y-1/2 rounded-full
                bg-[radial-gradient(circle_at_35%_30%,oklch(1_0_0/calc(var(--depth)*.5)),#0000)]
                bg-center bg-no-repeat align-middle
                shadow-[0_2px_3px_-1px_color-mix(in_oklab,currentColor_calc(var(--depth)*100%),#0000)]
                [--depth:1]
              `,
              profilesStore.profileId2ErrorMessageRecord[profile.id] && `
                bg-error text-error
              `,
              profilesStore.profileId2RelatedRuleIdRecord[profile.id] && `
                bg-success text-success
              `,
            )"
          />
          <i
            v-if="!profile.enabled"
            class="
              absolute right-0 bottom-0 i-lucide-pause size-4 -translate-1/2
            "
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{{ profile.name }} <component :is="renderShortcutHint(index)" /></p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </Button>
</template>
