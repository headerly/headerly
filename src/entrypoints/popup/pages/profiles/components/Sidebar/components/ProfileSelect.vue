<script setup lang="tsx">
import type { HeaderMod, Profile } from "@/lib/storage";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { useEventListener } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getModKey } from "@/lib/utils";

const profilesStore = useProfilesStore();

const profileRefs = ref<HTMLElement[]>([]);

// This functionality relies on top-level await in main.ts to work properly.
onMounted(() => {
  scrollToEnabledProfile("instant");
});

watch(
  () => profilesStore.manager.selectedProfileId,
  () => scrollToEnabledProfile("smooth"),
);

function scrollToEnabledProfile(behavior: ScrollBehavior) {
  const enabledIndex = profilesStore.manager.profiles.findIndex(profile => profile.id === profilesStore.manager.selectedProfileId);
  if (enabledIndex !== -1 && profileRefs.value[enabledIndex]) {
    profileRefs.value[enabledIndex].scrollIntoView({
      behavior,
      block: "center",
    });
  }
}

function getProfileStatus(profile: Profile) {
  function modNameAndValueIsExist(mod: HeaderMod) {
    if (mod.operation === "remove") {
      return mod.enabled && mod.name;
    }
    return mod.enabled && mod.name && mod.value;
  }
  const hasNameAndValueMod = profile.requestHeaderMods.some(mod => mod.enabled && modNameAndValueIsExist(mod))
    || profile.responseHeaderMods.some(mod => mod.enabled && modNameAndValueIsExist(mod));
  if (!hasNameAndValueMod) {
    return "empty";
  }

  if (!profile.enabled) {
    return "disabled";
  }

  return "working";
}

const settingsStore = useSettingsStore();
function handleSwitchProfileShortcut(event: KeyboardEvent) {
  if (!settingsStore.enableProfileShortcut) {
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
  if (!settingsStore.enableProfileShortcut || index >= 9) {
    return null;
  }
  return (
    <span>
      <kbd class="kbd kbd-sm font-mono mr-1">{getModKey()}</kbd>
      <kbd class="kbd kbd-sm font-mono">{String(index + 1)}</kbd>
    </span>
  );
}
</script>

<template>
  <div
    v-auto-animate
    class="
      flex flex-col gap-1 overflow-y-auto px-2 py-1.25
      [scrollbar-width:none]
    "
  >
    <div
      v-for="(profile, index) in profilesStore.manager.profiles" :key="profile.id"
      :ref="el => profileRefs[index] = el as HTMLElement"
    >
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="indicator">
              <button
                :class="cn(
                  `
                    btn btn-square text-xl btn-soft btn-sm
                    hover:btn-primary
                  `,
                  { 'btn-active btn-primary': profilesStore.manager.selectedProfileId === profile.id },
                )"
                @click="profilesStore.manager.selectedProfileId = profile.id"
              >
                {{ profile.emoji }}
              </button>
              <span
                :class="cn(
                  'indicator-item status',
                  getProfileStatus(profile) === 'working' && `status-success`,
                  getProfileStatus(profile) === 'disabled' && `status-error`,
                )"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ profile.name }} <Component :is="renderShortcutHint(index)" /></p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
