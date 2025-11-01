<script setup lang="tsx">
import type { UUID } from "node:crypto";
import type { HeaderMod, Profile } from "@/lib/type";
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
import ContextMenu from "./ContextMenu.vue";

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
    group => group.items.some(mod => mod.enabled && modNameAndValueIsExist(mod)),
  ) || profile.responseHeaderModGroups.some(
    group => group.items.some(mod => mod.enabled && modNameAndValueIsExist(mod)),
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
            <ContextMenu :id="profile.id" v-model="profilesStore.manager.profiles[index]!">
              <template #trigger>
                <button
                  :class="cn(
                    `
                      btn indicator btn-square text-xl btn-soft btn-sm
                      hover:btn-primary
                    `,
                    { 'btn-active btn-primary': profilesStore.manager.selectedProfileId === profile.id },
                  )"
                  @click="profilesStore.manager.selectedProfileId = profile.id"
                >
                  {{ profile.emoji }}
                  <span
                    :class="cn(
                      'indicator-item status',
                      getProfileStatus(profile) === 'working' && `
                        status-success
                      `,
                      getProfileStatus(profile) === 'disabled' && `
                        status-warning
                      `,
                    )"
                  />
                  <span
                    v-if="settingsStore.displayNumberBadge && index < 9"
                    class="
                      indicator-item badge size-4 px-1 font-mono indicator-start
                      indicator-middle
                    "
                  >
                    {{ index + 1 }}
                  </span>
                </button>
              </template>
            </ContextMenu>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ profile.name }} <Component :is="renderShortcutHint(index)" /></p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
