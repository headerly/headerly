<script setup lang="ts">
import type { Profile } from "@/lib/storage";
import { onMounted, ref, watch } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../stores/useProfilesStore";

const profilesStore = useProfilesStore();

const profileRefs = ref<HTMLElement[]>([]);

// This functionality relies on top-level await in main.ts to work properly.
onMounted(() => {
  scrollToEnabledProfile();
});

watch(
  () => profilesStore.manager.selectedProfileId,
  scrollToEnabledProfile,
);

function scrollToEnabledProfile() {
  const enabledIndex = profilesStore.orderedProfiles.findIndex(profile => profile.id === profilesStore.manager.selectedProfileId);
  if (enabledIndex !== -1 && profileRefs.value[enabledIndex]) {
    profileRefs.value[enabledIndex].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

function getProfileStatus(profile: Profile) {
  const hasNameAndValueMod = profile.requestHeaderMods.some(mod => mod.enabled && mod.name && mod.value)
    || profile.responseHeaderMods.some(mod => mod.enabled && mod.name && mod.value);
  if (!hasNameAndValueMod) {
    return "empty";
  }

  if (!profile.enabled) {
    return "disabled";
  }

  return "working";
}
</script>

<template>
  <div
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
                  getProfileStatus(profile) === 'disabled' && `status-warning`,
                )"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ profile.name }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
