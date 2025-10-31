<script setup lang="ts">
import type { UUID } from "node:crypto";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { computed, useTemplateRef, watch } from "vue";
import { cn } from "@/lib/utils";

const { id } = defineProps<{
  id: UUID;
}>();

const profilesStore = useProfilesStore();

const popoverRef = useTemplateRef("popoverRef");

const UI_TEXT = {
  pause: "Pause",
  resume: "Resume",
  duplicate: "Duplicate",
  delete: "Delete",
  moveUp: "Move Up",
  moveDown: "Move Down",
} as const;

watch(
  () => open,
  () => {
    popoverRef.value?.togglePopover();
  },
);

const currentProfile = computed(() => {
  return profilesStore.manager.profiles.find(profile => profile.id === id);
});

const popovertarget = `popover-profile-context-menu-${id}`;
</script>

<template>
  <div v-if="currentProfile">
    <div
      :popovertarget
      :style="`anchor-name:--${popovertarget}`"
      @contextmenu="(e) => {
        e.preventDefault();
        popoverRef?.togglePopover();
      }"
    >
      <slot name="trigger" />
    </div>
    <ul
      :id="popovertarget"
      ref="popoverRef"
      :style="`position-anchor:--${popovertarget}`"
      popover
      class="
        menu dropdown z-1 w-52 rounded-box bg-base-300 p-2 font-medium shadow-sm
        [position-area:span-end_end]
        [position-try-fallbacks:flip-block]
      "
    >
      <li>
        <button @click="profilesStore.toggleProfileEnabled(id)">
          <i
            :class="cn('size-4', currentProfile.enabled ? 'i-lucide-pause' : `
              i-lucide-play
            `)"
          />
          <span>
            {{ currentProfile.enabled ? UI_TEXT.pause : UI_TEXT.resume }}
          </span>
        </button>
      </li>
      <li>
        <button @click="profilesStore.duplicateProfile(id)">
          <i class="i-lucide-copy-plus size-4" />
          <span>{{ UI_TEXT.duplicate }}</span>
        </button>
      </li>
      <li>
        <button
          class="flex gap-2 text-error"
          @click="profilesStore.deleteProfile(id)"
        >
          <i class="i-lucide-trash size-4" />
          <span>{{ UI_TEXT.delete }}</span>
        </button>
      </li>
      <div class="divider my-0" />
      <li>
        <button
          :disabled="!profilesStore.canMoveProfileUp(id)"
          :class="{ 'disabled:pointer-events-none disabled:opacity-50': !profilesStore.canMoveProfileUp(id) }"
          @click="profilesStore.moveProfileUp(id)"
        >
          <i class="i-lucide-arrow-big-up size-4" />
          <span>{{ UI_TEXT.moveUp }}</span>
        </button>
      </li>
      <li>
        <button
          :disabled="!profilesStore.canMoveProfileDown(id)"
          :class="{ 'disabled:pointer-events-none disabled:opacity-50': !profilesStore.canMoveProfileDown(id) }"
          @click="profilesStore.moveProfileDown(id)"
        >
          <i class="i-lucide-arrow-big-down size-4" />
          <span>{{ UI_TEXT.moveDown }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
