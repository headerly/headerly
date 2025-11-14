<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useProfilesStore } from "#/stores/useProfilesStore";
import { useSettingsStore } from "#/stores/useSettingsStore";
import { cn, getModKey } from "@/lib/utils";
import ProfileManage from "./components/ProfileManage.vue";
import ProfileSelect from "./components/ProfileSelect.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();

function openInFullscreen() {
  browser.tabs.create({ url: browser.runtime.getURL("/popup.html") });
}

async function clearDnrRules() {
  const rules = await browser.declarativeNetRequest.getDynamicRules();
  const ruleIds = rules.map(rule => rule.id);
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds,
  });
}

const isDEV = import.meta.env.DEV;

const popovertarget = "popover-sidebar-menu";
</script>

<template>
  <aside
    :class="cn('flex h-full flex-col justify-between bg-base-200 py-2', className)"
  >
    <button
      :popovertarget
      :class="cn(
        `
          btn mx-2 btn-square btn-soft btn-sm btn-primary
          [anchor-name:--anchor-sidebar-menu]
        `,
        settingsStore.powerOn || 'opacity-60',
      )"
    >
      <i class="i-lucide-menu size-4" />
      <span class="sr-only">Open sidebar menu</span>
    </button>
    <ul
      :id="popovertarget"
      popover
      class="
        menu dropdown z-1 w-52 rounded-box bg-base-300 p-2 font-medium shadow-sm
        [position-anchor:--anchor-sidebar-menu]
      "
    >
      <li>
        <button class="flex flex-row items-center gap-2" @click="profilesStore.addProfile">
          <i class="i-lucide-cross size-4" />
          <span>Add New Profile</span>
        </button>
      </li>
      <li>
        <ProfileManage>
          <button
            class="flex flex-row items-center gap-2"
            :popovertarget
            popovertargetaction="hide"
          >
            <i class="i-lucide-search size-4" />
            <span>Search</span>
            <span v-if="settingsStore.enableMetaKSearch">
              <kbd class="mr-1 kbd font-mono kbd-sm">{{ getModKey() }}</kbd>
              <kbd class="kbd font-mono kbd-sm">K</kbd>
            </span>
          </button>
        </ProfileManage>
      </li>
      <li>
        <RouterLink to="/settings" class="flex flex-row items-center gap-2">
          <i class="i-lucide-settings size-4" />
          <span>Settings</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/about" class="flex flex-row items-center gap-2">
          <i class="i-lucide-badge-info size-4" />
          <span>About</span>
        </RouterLink>
      </li>
      <li v-if="isDEV">
        <button
          class="flex flex-row items-center gap-2"
          @click="openInFullscreen"
        >
          <i class="i-lucide-maximize size-4" />
          <span>Expand to Full Tab</span>
        </button>
      </li>
      <li v-if="isDEV">
        <button
          class="flex flex-row items-center gap-2"
          @click="clearDnrRules"
        >
          <i class="i-lucide-ban size-4" />
          <span>Clear DNR rules</span>
        </button>
      </li>
    </ul>

    <div class="divider m-0" />

    <div
      :class="cn(
        'flex flex-1 flex-col gap-1 overflow-y-hidden',
        settingsStore.powerOn || `opacity-60`,
      )"
    >
      <ProfileSelect />
    </div>

    <div class="divider m-0" />

    <div class="flex flex-col items-center">
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <label
              :class="cn(
                'btn btn-square btn-soft btn-sm',
                settingsStore.powerOn ? 'btn-error' : `
                  animate-pulse btn-success
                `,
              )"
            >
              <i class="i-lucide-power size-4" />
              <input
                v-model="settingsStore.powerOn"
                type="checkbox"
                class="sr-only"
              >
            </label>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ settingsStore.powerOn ? 'Turn off extension' : 'Turn on extension' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </aside>
</template>
