<script setup lang="ts">
import type { Profile, ProfileGroup } from "@/lib/schema";
import { useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import InfoTooltip from "#/components/InfoTooltip.vue";
import { Button } from "#/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/ui/context-menu";
import { Input } from "#/ui/input";
import { RadioGroup, RadioGroupItem } from "#/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "#/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/ui/tooltip";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { PROFILE_GROUP_COLOR_PRESETS } from "@/lib/const";
import { cn } from "@/lib/utils";
import ProfileGroupDisplayName from "../../ProfileGroupDisplayName.vue";
import { useProfileGroupActions } from "./useProfileGroupActions";

const props = defineProps<{
  group: ProfileGroup;
  open: boolean;
  profiles: Profile[];
}>();

const emit = defineEmits<{
  toggleOpen: [];
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();
const contextMenuContent = useTemplateRef<InstanceType<typeof ContextMenuContent>>("contextMenuContent");
const contextMenuTriggerButton = useTemplateRef<InstanceType<typeof Button>>("contextMenuTriggerButton");
const groupNameInput = useTemplateRef<InstanceType<typeof Input>>("groupNameInput");
const {
  deleteProfileGroup,
  hasEnabledProfile,
  hasRememberedProfiles,
  profileGroupToggleLabel,
  setGroupType,
  toggleProfileGroupEnabled,
  updateProfileGroup,
} = useProfileGroupActions(props);

function focusGroupNameInput(event: Event) {
  event.preventDefault();
  groupNameInput.value?.focus({ preventScroll: true });
}

function closeContextMenu() {
  contextMenuContent.value?.close();
}

function focusFirstMenuItem(event: KeyboardEvent) {
  event.stopPropagation();
  if (event.shiftKey)
    return;

  event.preventDefault();
  const toggleGroup = event.currentTarget as HTMLElement;
  const menuContent = toggleGroup.closest<HTMLElement>("[data-slot=\"context-menu-content\"]");
  menuContent
    ?.querySelector<HTMLElement>("[data-slot=\"context-menu-item\"]:not([data-disabled])")
    ?.focus({ preventScroll: true });
}

function openContextMenu() {
  const trigger = contextMenuTriggerButton.value?.$el as HTMLElement | undefined;
  if (!trigger)
    return;

  const rect = trigger.getBoundingClientRect();
  trigger.dispatchEvent(new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: rect.right,
    clientY: rect.top,
    view: window,
  }));
}

defineExpose({ open: openContextMenu });
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <Button
        ref="contextMenuTriggerButton"
        variant="secondary"
        size="icon-sm"
        data-profile-top-level-sort-handle
        class="h-6! shrink-0 text-background"
        :style="{ backgroundColor: group.color }"
        @click="emit('toggleOpen')"
      >
        <TooltipProvider ignore-non-keyboard-focus>
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="flex size-full items-center justify-center">
                <i
                  :class="cn(
                    'i-lucide-chevron-up size-4 transition-transform',
                    !open && 'rotate-180',
                  )"
                />
                <span class="sr-only">
                  {{ open ? t("group.collapse") : t("group.expand") }}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <ProfileGroupDisplayName :group :profiles />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Button>
    </ContextMenuTrigger>
    <ContextMenuContent
      ref="contextMenuContent"
      :collision-padding="32"
      class="w-64"
      @open-auto-focus="focusGroupNameInput"
    >
      <div class="space-y-3 p-2">
        <Input
          ref="groupNameInput"
          :model-value="group.name"
          :placeholder="t('profileGroup.namePlaceholder')"
          class="
            h-9 rounded-lg border-2 border-border bg-background/30 text-sm
            shadow-none ring-0 outline-none
            focus-visible:border-primary! focus-visible:ring-0
          "
          @click.stop
          @keydown.enter.stop.prevent="closeContextMenu"
          @keydown.tab.stop
          @update:model-value="updateProfileGroup({ name: $event })"
        />
        <RadioGroup
          :model-value="group.color"
          class="grid grid-cols-9 gap-1.5"
          @keydown.stop
          @update:model-value="updateProfileGroup({ color: $event as ProfileGroup['color'] })"
        >
          <RadioGroupItem
            v-for="(color, index) in PROFILE_GROUP_COLOR_PRESETS"
            :key="`${color}-${index}`"
            :value="color"
            :aria-label="color"
            class="
              size-4.5 border-0 shadow-none ring-0 outline-none
              focus-visible:ring-2 focus-visible:ring-ring/60
              data-[state=checked]:border-0
            "
            :style="{ backgroundColor: color }"
            @click.stop
          >
            <span
              class="
                grid size-3.5 place-items-center rounded-full bg-background
              "
            >
              <span
                class="size-2.25 rounded-full"
                :style="{ backgroundColor: color }"
              />
            </span>
          </RadioGroupItem>
        </RadioGroup>
      </div>
      <ContextMenuSeparator />
      <ToggleGroup
        type="single"
        :model-value="group.type"
        class="grid w-full grid-cols-2"
        @keydown.tab="focusFirstMenuItem"
        @update:model-value="setGroupType($event as ProfileGroup['type'])"
      >
        <ToggleGroupItem value="radio" class="h-8 min-w-0 rounded-sm">
          <i class="i-lucide-circle-dot size-4" />
          {{ t("common.radio") }}
        </ToggleGroupItem>
        <ToggleGroupItem value="checkbox" class="h-8 min-w-0 rounded-sm">
          <i class="i-lucide-square-check-big size-4" />
          {{ t("common.checkbox") }}
        </ToggleGroupItem>
      </ToggleGroup>
      <ContextMenuSeparator />
      <ContextMenuItem @click="profilesStore.addProfile('modifyHeaders', group.id)">
        <i class="i-lucide-plus-square size-4" />
        {{ t("profileGroup.actions.newProfile") }}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        class="justify-between gap-2"
        @click="toggleProfileGroupEnabled"
      >
        <span class="flex items-center gap-2">
          <i
            :class="cn(
              'size-4',
              hasEnabledProfile ? 'i-lucide-pause' : 'i-lucide-play',
            )"
          />
          {{ profileGroupToggleLabel }}
        </span>
        <span v-if="hasRememberedProfiles" @click.stop @pointerdown.stop>
          <InfoTooltip
            :description="hasEnabledProfile
              ? t('profileGroup.actions.pauseAndRememberDescription')
              : t('profileGroup.actions.resumeRememberedDescription')"
          />
        </span>
      </ContextMenuItem>
      <ContextMenuItem @click="profiles.forEach(profile => profilesStore.removeProfileFromGroup(profile.id))">
        <i class="i-lucide-ungroup size-4" />
        {{ t("profileGroup.actions.ungroup") }}
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" @click="deleteProfileGroup">
        <i class="i-lucide-trash size-4" />
        {{ t("profileGroup.actions.delete") }}
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
