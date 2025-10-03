<script setup lang="ts">
import type { ActionType } from "../stores/useProfilesStore";
import type { HeaderMod } from "@/lib/storage";
import { ref } from "vue";
import { useProfilesStore } from "../stores/useProfilesStore";

const { mod, index, type, currentModsLength } = defineProps<{
  mod: HeaderMod;
  index: number;
  type: ActionType;
  currentModsLength: number;
}>();

const profilesStore = useProfilesStore();
const commentsDialogRef = ref<HTMLDialogElement | null>(null);

const moreActions = [
  {
    key: "duplicate",
    label: "Duplicate",
    icon: "i-lucide-copy size-4",
    disabled: !mod.name && !mod.value,
    onClick: () => profilesStore.duplicateHeaderMod(type, mod.id),
  },
  {
    key: "comments",
    label: "Comments",
    icon: "i-lucide-square-pen size-4",
    disabled: false,
    onClick: () => commentsDialogRef.value?.showModal(),
  },
  { divider: true, key: "divider" },
  {
    key: "moveUp",
    label: "Move Up",
    icon: "i-lucide-arrow-big-up size-4",
    disabled: index === 0,
    onClick: () => profilesStore.moveUpHeaderMod(type, mod.id),
  },
  {
    key: "moveDown",
    label: "Move Down",
    icon: "i-lucide-arrow-big-down size-4",
    disabled: index === currentModsLength - 1,
    onClick: () => profilesStore.moveDownHeaderMod(type, mod.id),
  },
];

const comments = ref(mod.comments || "");
</script>

<template>
  <button
    :popovertarget="`popover-mod-more-action-${mod.id}`"
    :style="`anchor-name:--anchor-mod-more-action-${mod.id}`"
    class="btn btn-square btn-ghost btn-xs btn-primary"
  >
    <i class="i-lucide-ellipsis-vertical size-4" />
    <span class="sr-only">More options about this header mod</span>
  </button>
  <ul
    :id="`popover-mod-more-action-${mod.id}`"
    :style="`position-anchor:--anchor-mod-more-action-${mod.id}`"
    popover
    class="
      menu dropdown w-52 rounded-box bg-base-100 p-2 text-base-content shadow-sm
      [position-area:end_span-start]
      [position-try-fallbacks:flip-block]
    "
  >
    <template v-for="action in moreActions" :key="action.key">
      <div v-if="action.divider" class="divider my-0" />
      <li v-else>
        <button
          class="
            gap-2
            disabled:pointer-events-none disabled:opacity-50
          "
          :disabled="action.disabled"
          @click="action.onClick"
        >
          <i :class="action.icon" />
          <span>{{ action.label }}</span>
        </button>
      </li>
    </template>
  </ul>
  <dialog ref="commentsDialogRef" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">
        Edit Comments
      </h3>
      <textarea v-model="comments" class="textarea mt-4 h-24 w-full text-base" placeholder="Comments" />
      <div class="modal-action">
        <button
          class="btn btn-sm btn-primary" @click="() => {
            commentsDialogRef?.close()
            profilesStore.editModComments(type, mod.id, comments)
          }"
        >
          Save
        </button>
        <form method="dialog">
          <button class="btn btn-sm">
            Cancel
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>
