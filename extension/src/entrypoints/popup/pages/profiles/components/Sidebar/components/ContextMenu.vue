<script setup lang="ts">
import type { UUID } from "node:crypto";
import type { Profile } from "@/lib/type";
import CommentsDialog from "#/components/dialog/CommentsDialog.vue";
import { useTemplateRef, watch } from "vue";
import { copyProfile, copyProfileId } from "@/entrypoints/popup/pages/profiles/components/Header/components/copyProfile";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { cn } from "@/lib/utils";

const profile = defineModel<Profile>({
  required: true,
});

const { id } = defineProps<{
  id: UUID;
}>();

const profilesStore = useProfilesStore();

const popoverRef = useTemplateRef("popoverRef");

watch(
  () => open,
  () => {
    popoverRef.value?.togglePopover();
  },
);

const popovertarget = `popover-profile-context-menu-${id}`;

const commentsDialogRef = useTemplateRef("commentsDialogRef");
</script>

<template>
  <div v-if="profile">
    <div
      :popovertarget
      :style="`anchor-name:--${popovertarget}`"
      @contextmenu="(e) => {
        e.preventDefault()
      }"
      @mouseup="(event) => {
        // https://github.com/whatwg/html/issues/10905
        const rightClick = event.button === 2;
        if (rightClick || event.ctrlKey) {
          popoverRef?.showPopover();
        }
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
        menu dropdown rounded-box bg-base-300 z-1 w-52 p-2 font-medium shadow-sm
        [position-area:span-end_end]
        [position-try-fallbacks:flip-block]
      "
    >
      <li>
        <button @click="profilesStore.toggleProfileEnabled(id)">
          <i
            :class="cn('size-4', profile.enabled ? 'i-lucide-pause' : `
              i-lucide-play
            `)"
          />
          <span>
            {{ profile.enabled ? 'Pause' : 'Resume' }}
          </span>
        </button>
      </li>
      <li>
        <button @click="profilesStore.duplicateProfile(id)">
          <i class="i-lucide-copy-plus size-4" />
          <span>Duplicate</span>
        </button>
      </li>
      <li>
        <button
          class="text-error flex gap-2"
          @click="profilesStore.deleteProfile(id)"
        >
          <i
            :class="cn(
              'size-4',
              profilesStore.manager.profiles.length === 1
                ? `i-lucide-refresh-ccw` : `i-lucide-trash`,
            )"
          />
          <span>{{ profilesStore.manager.profiles.length === 1 ? 'Reset' : 'Delete' }}</span>
        </button>
      </li>
      <li>
        <button @click="commentsDialogRef?.open()">
          <i class="i-lucide-square-pen size-4" />
          <div class="indicator pr-2">
            <span>Comments</span>
            <span
              v-if="profile.comments.length"
              class="indicator-item status status-success indicator-middle"
            />
          </div>
        </button>
      </li>
      <li>
        <button @click="() => copyProfile(profile)">
          <i class="i-lucide-download size-4" />
          <span>Copy Profile</span>
        </button>
      </li>
      <li>
        <button
          @click="() => copyProfileId(profile)"
        >
          <i class="i-lucide-copy size-4" />
          <span>Copy ID</span>
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
          <span>Move Up</span>
        </button>
      </li>
      <li>
        <button
          :disabled="!profilesStore.canMoveProfileDown(id)"
          :class="{ 'disabled:pointer-events-none disabled:opacity-50': !profilesStore.canMoveProfileDown(id) }"
          @click="profilesStore.moveProfileDown(id)"
        >
          <i class="i-lucide-arrow-big-down size-4" />
          <span>Move Down</span>
        </button>
      </li>
    </ul>
    <CommentsDialog
      ref="commentsDialogRef"
      v-model="profile.comments"
    />
  </div>
</template>
