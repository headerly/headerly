<script setup lang="ts">
import { useProfilesStore } from "#/stores/useProfilesStore";
import { toast } from "vue-sonner";

const profilesStore = useProfilesStore();

const popovertarget = `popover-profile-secondary-operations`;

const UI_TEXT = {
  copyId: "Copy ID",
  duplicate: "Duplicate",
  moveUp: "Move Up",
  moveDown: "Move Down",
} as const;

async function copyProfileId() {
  await navigator.clipboard.writeText(profilesStore.selectedProfile.id);
  toast.success("Profile ID copied to clipboard.");
}
</script>

<template>
  <div>
    <div
      :popovertarget
      :style="`anchor-name:--${popovertarget}`"
    >
      <slot name="trigger" :popovertarget />
    </div>
    <ul
      :id="popovertarget"
      :style="`position-anchor:--${popovertarget}`"
      popover
      class="
        menu dropdown z-1 w-52 rounded-box bg-base-300 p-2 font-medium shadow-sm
        [position-area:end_span-start]
        [position-try-fallbacks:flip-block]
      "
    >
      <li>
        <button @click="copyProfileId">
          <i class="i-lucide-copy size-4" />
          <span>{{ UI_TEXT.copyId }}</span>
        </button>
      </li>
      <li>
        <button @click="profilesStore.duplicateProfile()">
          <i class="i-lucide-copy-plus size-4" />
          <span>{{ UI_TEXT.duplicate }}</span>
        </button>
      </li>
      <div class="divider my-0" />
      <li>
        <button
          :disabled="!profilesStore.canMoveProfileUp()"
          :class="{ 'disabled:pointer-events-none disabled:opacity-50': !profilesStore.canMoveProfileUp() }"
          @click="profilesStore.moveProfileUp()"
        >
          <i class="i-lucide-arrow-big-up size-4" />
          <span>{{ UI_TEXT.moveUp }}</span>
        </button>
      </li>
      <li>
        <button
          :disabled="!profilesStore.canMoveProfileDown()"
          :class="{ 'disabled:pointer-events-none disabled:opacity-50': !profilesStore.canMoveProfileDown() }"
          @click="profilesStore.moveProfileDown()"
        >
          <i class="i-lucide-arrow-big-down size-4" />
          <span>{{ UI_TEXT.moveDown }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
