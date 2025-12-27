<script setup lang="ts">
import CommentsDialog from "#/components/dialog/CommentsDialog.vue";
import { useTemplateRef } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { copyProfile, copyProfileId } from "./copyProfile";

const profilesStore = useProfilesStore();

const popovertarget = `popover-profile-secondary-operations`;

const commentsDialogRef = useTemplateRef("commentsDialogRef");
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
        menu dropdown rounded-box bg-base-300 z-1 w-52 p-2 font-medium shadow-sm
        [position-area:end_span-start]
        [position-try-fallbacks:flip-block]
      "
    >
      <li>
        <button @click="() => copyProfile(profilesStore.selectedProfile)">
          <i class="i-lucide-download size-4" />
          <span>Copy Profile</span>
        </button>
      </li>
      <li>
        <button @click="() => copyProfileId(profilesStore.selectedProfile)">
          <i class="i-lucide-copy size-4" />
          <span>Copy ID</span>
        </button>
      </li>
      <li>
        <button @click="profilesStore.duplicateProfile()">
          <i class="i-lucide-copy-plus size-4" />
          <span>Duplicate</span>
        </button>
      </li>
      <li>
        <button @click="commentsDialogRef?.open()">
          <i class="i-lucide-square-pen size-4" />
          <div class="indicator pr-2">
            <span>Comments</span>
            <span
              v-if="profilesStore.selectedProfile.comments.length"
              class="indicator-item status status-success indicator-middle"
            />
          </div>
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
          <span>Move Up</span>
        </button>
      </li>
      <li>
        <button
          :disabled="!profilesStore.canMoveProfileDown()"
          :class="{ 'disabled:pointer-events-none disabled:opacity-50': !profilesStore.canMoveProfileDown() }"
          @click="profilesStore.moveProfileDown()"
        >
          <i class="i-lucide-arrow-big-down size-4" />
          <span>Move Down</span>
        </button>
      </li>
    </ul>
    <CommentsDialog
      ref="commentsDialogRef"
      v-model="profilesStore.selectedProfile.comments"
    />
  </div>
</template>
