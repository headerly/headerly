<script setup lang="tsx">
import type { UUID } from "node:crypto";
import type { HeaderMod, Profile } from "@/lib/storage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { useEventListener } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { cn, getModKey } from "@/lib/utils";

const profilesStore = useProfilesStore();

// Vue cannot guarantee the order of refs,
// and must use id map management to ensure access to the correct element.
const profileRefs = ref<Map<UUID, HTMLDivElement>>(new Map());

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
      block: "center",
    });
  }
}
function modNameAndValueIsExist(mod: HeaderMod) {
  if (mod.operation === "remove") {
    return mod.enabled && mod.name;
  }
  return mod.enabled && mod.name && mod.value;
}

function hasNameAndValueMod(profile: Profile) {
  return profile.requestHeaderModGroups.some(
    group => group.mods.some(mod => mod.enabled && modNameAndValueIsExist(mod)),
  ) || profile.responseHeaderModGroups.some(
    group => group.mods.some(mod => mod.enabled && modNameAndValueIsExist(mod)),
  );
}
function getProfileStatus(profile: Profile) {
  if (!hasNameAndValueMod(profile)) {
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
