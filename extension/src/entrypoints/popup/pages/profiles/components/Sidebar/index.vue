<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { RuleActionType } from "@/lib/schema";
import InfoTooltip from "#/components/InfoTooltip.vue";
import { Button } from "#/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useStorage } from "@vueuse/core";
import { defineAsyncComponent, ref } from "vue";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn, getRuleActionTypeLabel } from "@/lib/utils";
import ProfileManage from "./components/ProfileManage.vue";
import ProfileSwitcher from "./components/ProfileSwitcher.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const ImportProfileModal = defineAsyncComponent(() => import("./components/ImportProfileModal.vue"));

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
const importModalOpen = ref(false);

const defaultRuleActionType = useStorage<RuleActionType>("default-rule-action-type", "modifyHeaders");

function openInFullscreen() {
  browser.tabs.create({ url: browser.runtime.getURL("/popup.html") });
}

const ruleActionTypes = ["modifyHeaders", "block", "allow", "upgradeScheme", "allowAllRequests"] as const;
const ruleActionTypeDescriptions = {
  modifyHeaders: "Modify request/response headers from the network request",
  block: "Block the network request",
  allow: "Allow the network request. The request won't be intercepted if there is an allow rule which matches it",
  upgradeScheme: "Upgrade the network request URL's scheme to HTTPS if the request is HTTP or FTP",
  allowAllRequests: "Allow all requests within a frame hierarchy, including the frame request itself",
  redirect: "Redirect the network request.",
} as const;
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
            `mx-2`,
            settingsStore.powerOn || 'opacity-60',
          )"
        >
          <i class="i-lucide-menu size-4" />
          <span class="sr-only">Open sidebar menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-40" align="end" :collision-padding="8">
        <DropdownMenuGroup>
          <DropdownMenuItem @click="profilesStore.addProfile(defaultRuleActionType)">
            Quick create
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              New profile
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="min-w-40">
              <DropdownMenuSub
                v-for="type in ruleActionTypes"
                :key="type"
              >
                <DropdownMenuSubTrigger
                  class="cursor-pointer"
                  hide-arrow
                  @click="profilesStore.addProfile(type)"
                >
                  {{ getRuleActionTypeLabel(type) }}
                  <InfoTooltip
                    :description="ruleActionTypeDescriptions[type]"
                    class="ml-1"
                  />
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem @click="defaultRuleActionType = type">
                    Make as default
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <ProfileManage>
            <DropdownMenuItem @select.prevent>
              Search profile
            </DropdownMenuItem>
          </ProfileManage>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem @click="importModalOpen = true">
              Import profiles
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <RouterLink to="/export">
                Export profiles
              </RouterLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
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
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem @click="openInFullscreen">
            Expand to full tab
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <div
      class="
        flex h-4 items-center self-stretch
        before:h-0.5 before:w-full before:grow before:bg-border
        before:content-['']
      "
    />
    <div
      :class="cn(
        'flex flex-1 flex-col overflow-y-hidden',
        settingsStore.powerOn || `opacity-60`,
      )"
    >
      <ProfileSwitcher />
    </div>

    <div
      class="
        flex h-4 items-center self-stretch
        before:h-0.5 before:w-full before:grow before:bg-border
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
                class="data-[state=checked]:bg-brand!"
              />
            </Label>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ settingsStore.powerOn ? 'Turn off extension' : 'Turn on extension' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <ImportProfileModal v-model:open="importModalOpen" />
  </aside>
</template>
