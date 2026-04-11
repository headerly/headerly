<script setup lang="tsx">
import type { Profile } from "@/lib/schema";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { Button } from "#/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { computed } from "vue";
import { cn } from "@/lib/utils";

const { profile, class: className } = defineProps<{
  profile: Profile;
  index: number;
  showShortcutHint?: boolean;
  class?: string;
  as?: string;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const profilesStore = useProfilesStore();

const isSelected = computed(() => profilesStore.manager.selectedProfileId === profile.id);
</script>

<template>
  <Button
    size="icon-sm"
    :variant="isSelected ? 'default' : 'secondary'"
    :class="cn('relative flex text-xl select-none', isSelected && 'bg-brand!', className)"
    :as
    @click="emit('click')"
  >
    <TooltipProvider ignore-non-keyboard-focus>
      <Tooltip>
        <TooltipTrigger as-child>
          <div class="relative flex size-full items-center justify-center">
            <slot />
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
              :class="
                cn(`
                  absolute right-0 bottom-0 i-lucide-pause size-4 -translate-1/2
                `)
              "
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{{ profile.name }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </Button>
</template>
