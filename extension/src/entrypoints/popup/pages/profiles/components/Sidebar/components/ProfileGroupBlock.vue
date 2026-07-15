<script setup lang="ts">
import type { Profile, ProfileGroup } from "@/lib/schema";
import { AnimatePresence, motion } from "motion-v";
import { computed, useTemplateRef } from "vue";
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
import { useSortableAndAutoAnimate } from "@/composables/useSortableAndAutoAnimate";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { PROFILE_GROUP_COLOR_PRESETS } from "@/lib/const";
import { cn } from "@/lib/utils";
import ProfileGroupDisplayName from "../../ProfileGroupDisplayName.vue";
import ProfileListItem from "./ProfileListItem.vue";

const props = defineProps<{
  collapsed: boolean;
  group: ProfileGroup;
  profiles: Profile[];
}>();

const emit = defineEmits<{
  (e: "sortProfiles", event: { newIndex: number; oldIndex: number }): void;
  (e: "toggle"): void;
  (e: "setRef", el: HTMLDivElement | null, profileId: string): void;
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();
const contextMenuContent = useTemplateRef<InstanceType<typeof ContextMenuContent>>("contextMenuContent");
const contextMenuTriggerButton = useTemplateRef<InstanceType<typeof Button>>("contextMenuTriggerButton");
const groupNameInput = useTemplateRef<InstanceType<typeof Input>>("groupNameInput");
const listContainer = useTemplateRef<HTMLElement>("listContainer");
const hasEnabledProfile = computed(() => props.profiles.some(profile => profile.enabled));
const hasRememberedProfiles = computed(() => {
  const profileIds = new Set(props.profiles.map(profile => profile.id));
  return props.group.lastEnabledProfileIds?.some(profileId => profileIds.has(profileId)) ?? false;
});
const profileGroupToggleLabel = computed(() => {
  if (hasEnabledProfile.value) {
    return t("profileGroup.actions.pauseAndRemember");
  }
  if (hasRememberedProfiles.value) {
    return t("profileGroup.actions.resumeRemembered");
  }
  return t("profileGroup.actions.resume");
});

useSortableAndAutoAnimate({
  disabled: computed(() => props.collapsed),
  listContainer,
  list: props.profiles,
  onUpdate: event => emit("sortProfiles", event),
});

function setGroupType(group: ProfileGroup, type: ProfileGroup["type"]) {
  if (type !== "radio" && type !== "checkbox")
    return;

  profilesStore.updateProfileGroup(group.id, { type });
}

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

defineExpose({ openContextMenu });
</script>

<template>
  <div class="relative flex gap-1.5">
    <motion.div
      class="shrink-0 origin-top rounded-full"
      :style="{ backgroundColor: group.color }"
      :initial="false"
      :animate="collapsed
        ? { width: 0, opacity: 0, marginLeft: -6, scaleY: 0 }
        : { width: 3, opacity: 1, marginLeft: -9, scaleY: 1 }"
      :transition="{ duration: 0.18, ease: 'easeOut' }"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <ContextMenu>
        <ContextMenuTrigger as-child>
          <Button
            ref="contextMenuTriggerButton"
            variant="secondary"
            size="icon-sm"
            data-profile-top-level-sort-handle
            class="h-6! shrink-0 text-background"
            :style="{ backgroundColor: group.color }"
            @click="emit('toggle')"
          >
            <TooltipProvider ignore-non-keyboard-focus>
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="flex size-full items-center justify-center">
                    <i
                      :class="cn(
                        'i-lucide-chevron-up size-4 transition-transform',
                        collapsed && 'rotate-180',
                      )"
                    />
                    <span class="sr-only">
                      {{ collapsed ? t("group.expand") : t("group.collapse") }}
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
          class="w-64 p-0"
          @open-auto-focus="focusGroupNameInput"
        >
          <div class="space-y-3 p-3">
            <Input
              ref="groupNameInput"
              :model-value="group.name"
              :placeholder="t('profileGroup.namePlaceholder')"
              class="
                h-9 rounded-lg border-2 border-border/80 bg-background/30 px-3
                text-sm shadow-none ring-0 outline-none
                focus-visible:ring-0 focus-visible:outline-primary!
              "
              @click.stop
              @keydown.enter.stop.prevent="closeContextMenu"
              @keydown.tab.stop
              @update:model-value="profilesStore.updateProfileGroup(group.id, { name: $event })"
            />
            <RadioGroup
              :model-value="group.color"
              class="grid grid-cols-9 gap-1.5"
              @keydown.stop
              @update:model-value="profilesStore.updateProfileGroup(group.id, { color: $event as ProfileGroup['color'] })"
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
                    class="size-2 rounded-full"
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
            class="grid w-full grid-cols-2 px-1"
            @keydown.tab="focusFirstMenuItem"
            @update:model-value="setGroupType(group, $event as ProfileGroup['type'])"
          >
            <ToggleGroupItem value="radio" class="min-w-0">
              <i class="i-lucide-circle-dot size-4" />
              {{ t("common.radio") }}
            </ToggleGroupItem>
            <ToggleGroupItem value="checkbox" class="min-w-0">
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
            @click="profilesStore.toggleProfileGroupEnabled(group.id)"
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
          <ContextMenuItem variant="destructive" @click="profilesStore.deleteProfileGroup(group.id)">
            <i class="i-lucide-trash size-4" />
            {{ t("profileGroup.actions.delete") }}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <AnimatePresence :initial="false">
        <motion.div
          v-if="!collapsed"
          key="profile-group-items"
          class="overflow-x-visible overflow-y-clip"
          :initial="{ height: 0, opacity: 0, y: -4 }"
          :animate="{ height: 'auto', opacity: 1, y: 0 }"
          :exit="{ height: 0, opacity: 0, y: -4 }"
          :transition="{ duration: 0.18, ease: 'easeOut' }"
        >
          <div ref="listContainer" class="flex flex-col gap-1">
            <div
              v-for="(profile, index) in profiles"
              :key="profile.id"
              :ref="(el) => emit('setRef', el as HTMLDivElement | null, profile.id)"
            >
              <ProfileListItem
                :index
                :profile
                layout="icon"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
