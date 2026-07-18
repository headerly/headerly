<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { RuleActionType } from "@/lib/schema";
import { useStorage } from "@vueuse/core";
import { match } from "ts-pattern";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import InfoTooltip from "#/components/InfoTooltip.vue";
import { useRuleActionType } from "#/composables/useRuleActionType";
import Badge from "#/ui/badge/Badge.vue";

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
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { useSettingsStore } from "@/entrypoints/popup/stores/useSettingsStore";
import { cn } from "@/lib/utils";
import ProfileSwitcher from "./components/ProfileSwitcher.vue";

const { class: className } = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const profilesStore = useProfilesStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();
const ruleActionTypeMap = useRuleActionType();

const defaultRuleActionType = useStorage<RuleActionType>("default-rule-action-type", "modifyHeaders");

function openInFullscreen() {
  browser.tabs.create({ url: browser.runtime.getURL("/popup.html") });
}

const menuOpen = ref(false);

const ruleActionTypes = [
  "modifyHeaders",
  "block",
  "allow",
  "upgradeScheme",
  "allowAllRequests",
  "redirect",
] as const satisfies RuleActionType[];

function getRuleActionTypeDescription(type: RuleActionType) {
  return match(type)
    .with("modifyHeaders", () => t("ruleAction.description.modifyHeaders"))
    .with("block", () => t("ruleAction.description.block"))
    .with("allow", () => t("ruleAction.description.allow"))
    .with("upgradeScheme", () => t("ruleAction.description.upgradeScheme"))
    .with("allowAllRequests", () => t("ruleAction.description.allowAllRequests"))
    .with("redirect", () => t("ruleAction.description.redirect"))
    .exhaustive();
}
</script>

<template>
  <aside
    :class="cn(
      `
        flex h-full flex-col justify-between border-r border-r-(--pattern-fg)
        bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
        bg-size-[10px_10px] bg-fixed py-2 [--pattern-fg:var(--color-gray-950)]/5
        dark:[--pattern-fg:var(--color-white)]/10
      `,
      className,
    )"
  >
    <DropdownMenu v-model:open="menuOpen">
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
          <span class="sr-only">{{ t("profile.sidebar.openMenu") }}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-40" align="end" :collision-padding="8">
        <DropdownMenuGroup>
          <DropdownMenuItem class="justify-between gap-1" @click="profilesStore.addProfile(defaultRuleActionType)">
            {{ t("profile.sidebar.quickCreate") }}
            <InfoTooltip
              :description="t('profile.sidebar.quickCreateDescription')"
            />
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {{ t("profile.sidebar.newProfile") }}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="min-w-40">
              <DropdownMenuSub
                v-for="type in ruleActionTypes"
                :key="type"
              >
                <DropdownMenuSubTrigger
                  class="cursor-pointer justify-between gap-2"
                  hide-arrow
                  @click="() => {
                    profilesStore.addProfile(type)
                    menuOpen = false
                  }"
                >
                  {{ ruleActionTypeMap[type].label }}
                  <InfoTooltip
                    :description="getRuleActionTypeDescription(type)"
                  />
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem v-if="type !== defaultRuleActionType" @click="defaultRuleActionType = type">
                    {{ t("profile.sidebar.makeDefault") }}
                  </DropdownMenuItem>
                  <DropdownMenuItem v-else disabled class="opacity-100!">
                    <Badge>
                      {{ t("profile.sidebar.defaultActionType") }}
                    </Badge>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {{ t("profile.sidebar.profiles") }}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem as-child>
                <RouterLink to="/import">
                  <i class="i-lucide-upload size-4 shrink-0" />
                  {{ t("common.import") }}
                </RouterLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <RouterLink to="/export">
                  <i class="i-lucide-share-2 size-4 shrink-0" />
                  {{ t("common.share") }}
                </RouterLink>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem as-child>
            <RouterLink to="/settings">
              {{ t("common.settings") }}
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {{ t("profile.sidebar.resources") }}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem as-child>
                <a href="https://headerly.dev/guide/getting-started" target="_blank">
                  <i class="i-lucide-book-open size-4 shrink-0" />
                  {{ t("profile.sidebar.documentation") }}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <a href="https://github.com/headerly/headerly" target="_blank">
                  <i class="i-lucide-github size-4 shrink-0" />
                  {{ t("common.github") }}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <a href="https://github.com/headerly/headerly/blob/main/extension/CHANGELOG.md" target="_blank">
                  <i class="i-lucide-scroll-text size-4 shrink-0" />
                  {{ t("profile.sidebar.changelog") }}
                </a>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem @click="openInFullscreen">
            {{ t("profile.sidebar.openInTab") }}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <div
      class="
        flex h-4 items-center self-stretch
        before:h-px before:w-full before:grow before:bg-border
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
        before:h-px before:w-full before:grow before:bg-border
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
            <p>{{ settingsStore.powerOn ? t("profile.sidebar.turnOff") : t("profile.sidebar.turnOn") }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </aside>
</template>
