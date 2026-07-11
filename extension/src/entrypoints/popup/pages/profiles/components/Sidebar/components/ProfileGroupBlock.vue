<script setup lang="ts">
import type { Profile, ProfileGroup } from "@/lib/schema";
import { AnimatePresence, motion } from "motion-v";
import { useI18n } from "vue-i18n";
import { Button } from "#/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/ui/context-menu";
import { Input } from "#/ui/input";
import { useProfilesStore } from "@/entrypoints/popup/stores/useProfilesStore";
import { PROFILE_GROUP_COLORS } from "@/lib/schema";
import { cn } from "@/lib/utils";
import ProfileListItem from "./ProfileListItem.vue";
import { getProfileGroupColorClass } from "./utils";

defineProps<{
  collapsed: boolean;
  group: ProfileGroup;
  profiles: Profile[];
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
  (e: "setRef", el: HTMLDivElement | null, profileId: string): void;
}>();

const profilesStore = useProfilesStore();
const { t } = useI18n();

function setGroupType(group: ProfileGroup, type: ProfileGroup["type"]) {
  profilesStore.updateProfileGroup(group.id, { type });
}
</script>

<template>
  <div class="relative flex gap-1.5">
    <motion.div
      :class="cn(
        'shrink-0 origin-top rounded-full',
        getProfileGroupColorClass(group.color),
      )"
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
            variant="secondary"
            size="icon-sm"
            :class="cn(
              `h-6! shrink-0 text-background`,
              getProfileGroupColorClass(group.color),
            )"
            @click="emit('toggle')"
          >
            <i
              :class="cn(
                'i-lucide-chevron-up size-4 transition-transform',
                collapsed && 'rotate-180',
              )"
            />
            <span class="sr-only">
              {{ collapsed ? t("group.expand") : t("group.collapse") }}
            </span>
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent :collision-padding="32" class="w-56 p-0">
          <div class="space-y-3 p-3">
            <Input
              :model-value="group.name"
              :placeholder="t('profileGroup.namePlaceholder')"
              class="h-10"
              @click.stop
              @keydown.stop
              @update:model-value="profilesStore.updateProfileGroup(group.id, { name: $event })"
            />
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in PROFILE_GROUP_COLORS"
                :key="color"
                type="button"
                :class="cn(
                  'grid size-5 place-items-center rounded-full',
                  getProfileGroupColorClass(color),
                )"
                @click.prevent.stop="profilesStore.updateProfileGroup(group.id, { color })"
              >
                <i
                  v-if="group.color === color" class="
                    i-lucide-check size-3.5 text-background
                  "
                />
                <span class="sr-only">{{ color }}</span>
              </button>
            </div>
            <ContextMenuRadioGroup
              :model-value="group.type"
              class="grid grid-cols-2 gap-1"
              @update:model-value="setGroupType(group, $event as ProfileGroup['type'])"
            >
              <ContextMenuRadioItem value="radio">
                {{ t("common.radio") }}
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="checkbox">
                {{ t("common.checkbox") }}
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </div>
          <ContextMenuSeparator />
          <ContextMenuItem @click="profilesStore.addProfile('modifyHeaders', group.id)">
            <i class="i-lucide-plus-square size-4" />
            {{ t("profileGroup.actions.newProfile") }}
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
          class="flex flex-col gap-1 overflow-x-visible overflow-y-clip"
          :initial="{ height: 0, opacity: 0, y: -4 }"
          :animate="{ height: 'auto', opacity: 1, y: 0 }"
          :exit="{ height: 0, opacity: 0, y: -4 }"
          :transition="{ duration: 0.18, ease: 'easeOut' }"
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
