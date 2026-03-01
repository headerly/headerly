<script setup lang="tsx">
import { Button } from "#/ui/button";
import { Kbd } from "#/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useEventListener } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn, getModKey } from "@/lib/utils";
import ContextMenuWithTrigger from "../../ProfileActions/ContextMenuWithTrigger.vue";

const profilesStore = useProfilesStore();

// Vue cannot guarantee the order of refs,
// and must use id map management to ensure access to the correct element.
const profileRefs = ref<Map<string, HTMLDivElement>>(new Map());

onMounted(() => scrollToEnabledProfile("instant"));

watch(
  () => profilesStore.manager.selectedProfileId,
  () => scrollToEnabledProfile("smooth"),
  // Wait for DOM to be updated, otherwise the latest DOM element cannot be accessed.
  { flush: "post" },
);

function scrollToEnabledProfile(behavior: ScrollBehavior) {
  const target = profileRefs.value.get(profilesStore.manager.selectedProfileId);
  if (target) {
    target.scrollIntoView({
      behavior,
      block: "end",
    });
  }
}

const settingsStore = useSettingsStore();
function handleSwitchProfileShortcut(event: KeyboardEvent) {
  if (!settingsStore.enableMetaNumberShortcut) {
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key >= "1" && event.key <= "9") {
    event.preventDefault();
    const index = Number(event.key) - 1;
    const profiles = profilesStore.manager.profiles;
    if (index < profiles.length) {
      const profile = profiles[index]!;
      profilesStore.manager.selectedProfileId = profile.id;
    }
  }
}

useEventListener(window, "keydown", handleSwitchProfileShortcut);

function renderShortcutHint(index: number) {
  if (!settingsStore.enableMetaNumberShortcut || index >= 9) {
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
  <TooltipProvider ignore-non-keyboard-focus>
    <div
      v-auto-animate
      class="
        flex flex-col gap-1 overflow-y-auto px-2 py-1.25 [scrollbar-width:none]
      "
    >
      <div
        v-for="(profile, index) in profilesStore.manager.profiles"
        :key="profile.id"
        :ref="(el) => {
          if (el === null) {
            profileRefs.delete(profile.id);
          } else {
            profileRefs.set(profile.id, el as HTMLDivElement);
          }
        }"
      >
        <ContextMenuWithTrigger :profile>
          <Button
            size="icon-sm"
            :variant="profilesStore.manager.selectedProfileId === profile.id ? 'default' : 'secondary'"
            class="relative flex text-xl"
            @click="profilesStore.manager.selectedProfileId = profile.id"
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
                        absolute top-0 right-0 z-10 inline-block aspect-square
                        size-2 translate-x-1/2 -translate-y-1/2 rounded-full
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
                      absolute right-0 bottom-0 i-lucide-pause size-4
                      -translate-1/2
                    "
                  />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{{ profile.name }} <component :is="renderShortcutHint(index)" /></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Button>
        </ContextMenuWithTrigger>
      </div>
    </div>
  </TooltipProvider>
</template>
