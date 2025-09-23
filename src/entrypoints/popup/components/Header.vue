<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { ref } from "vue";
import { cn } from "@/lib/utils";
import { useProfilesStore } from "../useProfilesStore";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const store = useProfilesStore();

function openInFullscreen() {
  browser.tabs.create({ url: "popup.html" });
}

const profileNameEditing = ref(false);
const profileNameInput = ref<string>();
function handleEditProfileName() {
  if (profileNameInput.value?.length && store.selectedProfile) {
    store.selectedProfile.name = profileNameInput.value;
  }
  profileNameEditing.value = false;
}
</script>

<template>
  <header
    :class="cn(`
      flex items-center justify-between gap-1 bg-base-200 py-1 pr-1 pl-2
    `, className)"
  >
    <button
      v-if="!profileNameEditing"
      class="
        btn flex items-center gap-1.5 text-base font-semibold btn-ghost btn-sm
      "
      @click="() => {
        profileNameInput = store.selectedProfile?.name
        profileNameEditing = true
      }"
    >
      <span class="max-w-50 overflow-hidden overflow-ellipsis whitespace-nowrap">{{ store.selectedProfile?.name }}</span>
      <i class="i-lucide-pencil-line size-4" />
    </button>
    <div v-else class="flex gap-1.5">
      <input
        v-model="profileNameInput"
        type="text"
        required
        class="
          input input-sm max-w-xs text-base
          user-invalid:input-error
        "
        @keyup.enter="handleEditProfileName"
        @keyup.esc="profileNameEditing = false"
      >
      <button
        class="
          btn flex btn-square items-center gap-2 text-base font-semibold
          btn-soft btn-sm
        "
        @click="handleEditProfileName"
      >
        <i class="i-lucide-check-check size-4" />
      </button>
    </div>
    <div
      v-if="store.selectedProfile"
      class="flex items-center justify-between gap-1 bg-base-200 p-1"
    >
      <div class="tooltip tooltip-left font-semibold" :data-tip="store.selectedProfile.enabled ? 'Pause current profile' : 'Resume current profile'">
        <input
          v-model="store.selectedProfile.enabled"
          type="checkbox"
          :class="cn(
            `
              btn btn-square btn-ghost btn-sm btn-primary
              before:size-4
              after:hidden
            `,
            store.selectedProfile.enabled
              ? 'before:i-lucide-pause'
              : `
                btn-active
                before:i-lucide-play
              `,
          )"
        >
      </div>
      <button
        class="tooltip btn tooltip-left btn-square btn-ghost btn-sm btn-primary"
        data-tip="Add new request header mod"
        @click="store.addRequestHeaderMod('set')"
      >
        <i class="i-lucide-plus size-4" />
      </button>
      <button
        class="tooltip btn tooltip-left btn-square btn-ghost btn-sm btn-error"
        data-tip="Delete current profile"
        @click="store.deleteProfile"
      >
        <i class="i-lucide-trash size-4" />
      </button>
      <button
        class="tooltip btn tooltip-left btn-square btn-soft btn-sm"
        data-tip="Open in fullscreen"
        @click="openInFullscreen"
      >
        <i class="i-lucide-maximize-2 size-4" />
      </button>
    </div>
  </header>
</template>
