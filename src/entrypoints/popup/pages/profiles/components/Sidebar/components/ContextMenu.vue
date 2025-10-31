<script setup lang="ts">
import { useProfilesStore } from "#/stores/useProfilesStore";
import { computed, useTemplateRef, watch } from "vue";
import { cn } from "@/lib/utils";

const { id } = defineProps<{
  id: string;
}>();

const profilesStore = useProfilesStore();

const popoverRef = useTemplateRef("popoverRef");

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
        <button>
          <i
            :class="cn('size-4', currentProfile.enabled ? 'i-lucide-pause' : `
              i-lucide-play
            `)"
          />
          <span>
            {{ currentProfile.enabled ? 'Pause' : 'Resume' }}
          </span>
        </button>
      </li>
      <li>
        <button>
          <i class="i-lucide-copy-plus size-4" />
          <span>Duplicate</span>
        </button>
      </li>
      <li>
        <button
          class="flex gap-2 text-error"
        >
          <i class="i-lucide-trash size-4" />
          <span>Delete</span>
        </button>
      </li>
      <div class="divider my-0" />
      <li>
        <button>
          <i class="i-lucide-arrow-big-up size-4" />
          <span>Move Up</span>
        </button>
      </li>
      <li>
        <button>
          <i class="i-lucide-arrow-big-down size-4" />
          <span>Move Down</span>
        </button>
      </li>
    </ul>
  </div>
</template>
