<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "#/ui/dropdown-menu";
import { Label } from "#/ui/label";
import { Switch } from "#/ui/switch";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { sendMessage } from "@/entrypoints/background/message";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
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
</script>

<template>
  <aside
    :class="cn(`flex h-full flex-col justify-between border-r py-2`, className)"
  >
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="secondary"
          size="icon-sm"
          :class="cn(
            `mx-2 [anchor-name:--anchor-sidebar-menu]`,
            settingsStore.powerOn || 'opacity-60',
          )"
        >
          <i class="i-lucide-menu size-4" />
          <span class="sr-only">Open sidebar menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-40" align="end" :collision-padding="8">
        <DropdownMenuGroup>
          <DropdownMenuItem @click="profilesStore.addProfile()">
            New profile
          </DropdownMenuItem>
          <ProfileManage>
            <DropdownMenuItem @select.prevent>
              Search profile
              <DropdownMenuShortcut v-if="settingsStore.enableMetaKSearch">
                {{ `${getModKey()}+K` }}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProfileManage>
          <DropdownMenuItem as-child>
            <RouterLink to="/import">
              Import profile
            </RouterLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem as-child>
            <RouterLink to="/settings">
              Settings
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <RouterLink to="/about">
              About
            </RouterLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <template v-if="isDEV">
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @click="openInFullscreen">
              Expand to full tab
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="() => {
                sendMessage('reinitializeAllRules');
              }"
            >
              Reinitialize DNR rules
            </DropdownMenuItem>
            <DropdownMenuItem class="text-destructive!" @click="clearDnrRules">
              Clear DNR rules
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
    <div
      class="
        flex h-4 items-center self-stretch
        before:h-0.5 before:w-full before:grow-1 before:bg-border
        before:content-['']
      "
    />
    <div
      :class="cn(
        'flex flex-1 flex-col overflow-y-hidden',
        settingsStore.powerOn || `opacity-60`,
      )"
    >
      <ProfileSelect />
    </div>

    <div
      class="
        flex h-4 items-center self-stretch
        before:h-0.5 before:w-full before:grow-1 before:bg-border
        before:content-['']
      "
    />

    <div class="flex flex-col items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Label class="size-8">
              <Switch
                v-model="settingsStore.powerOn"
              />
            </Label>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ settingsStore.powerOn ? 'Turn off extension' : 'Turn on extension' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </aside>
</template>
